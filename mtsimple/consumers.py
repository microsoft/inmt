from __future__ import unicode_literals
from channels.generic.websocket import WebsocketConsumer
import json

from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.decorators import login_required

from .models import *

import re

import json

import re
import ast

import sys
import os
dir_path = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
sys.path.insert(0, os.path.join(dir_path, 'opennmt'))

from itertools import repeat

from onmt.utils.logging import init_logger
from onmt.utils.misc import split_corpus
from onmt.translate.infertranslator import build_translator

import onmt.opts as opts
from onmt.utils.parse import ArgumentParser

import pickle
import random

from indic_transliteration import sanscript
from indic_transliteration.sanscript import SchemeMap, SCHEMES, transliterate

import requests


langspecs = {
    'en-hi' : {
        'src' : 'en',
        'tgt' : 'hi',
        'model': 'full_iitb_enhi_50v.pt',
        'indic_code': sanscript.DEVANAGARI,
        'provide_help' : True,
    },
    'hi-en' : {
        'src' : 'hi',
        'tgt' : 'en',
        'model': 'full_iitb_bpe_hien.pt',
        'indic_code': None,
        'provide_help' : False,
    },
    # '*-en' : {
    #     'src' : 'hi',
    #     'tgt' : 'en',
    #     'model': 'multiling.pt',
    #     'indic_code': None,
    #     'provide_help' : False,
    # }
}

with open(os.path.join(dir_path, 'opt_data'), 'rb') as f:
        opt = pickle.load(f)

engines = {}
for key, value in langspecs.items():
    opt.models = [os.path.join(dir_path, 'model', value['model'])]
    opt.n_best = 1
    opt.max_length = 100
    opt.global_attention_function = 'sparsemax'
    ArgumentParser.validate_translate_opts(opt)
    engines[key] = {"translatorbest": build_translator(opt, report_score=True)}

    opt.n_best = 5
    opt.max_length = 2
    opt.global_attention_function = 'sparsemax'
    ArgumentParser.validate_translate_opts(opt)
    engines[key]["translatorbigram"] = build_translator(opt, report_score=True)

def toquotapos(s, lang="en"):
    # if lang=="en":
    s = s.lower()
    s = re.sub(r"([\“\”])", r'"', s)
    s = re.sub(r"([\‘\’])", r"'", s)
    s = re.sub(r"([\ः])", r":", s)
    s = re.sub(r"([-!$%^&*()_+|~=`{}\[\]:\";<>?,.\/#@।]+)", r" \1 ", s)
    s = re.sub(r'"', r'&quot;', s)
    s = re.sub(r"'", r"&apos;", s)
    s = re.sub(r"(\s+)", r" ", s)
    return s

def quotaposto(s, lang="en"):
    s = re.sub(r"&quot;", r'"', s)
    s = re.sub(r"&apos;", r"'", s)
    s = re.sub(r"(@@ )|(@@ ?$)", r"", s)
    #This is work in progress to make writing as natural as possible. taking care of spaces before and after certain characters.
    # s = re.sub(r"(\s+)([!:?,.।\']+)", r"\2", s)
    # s = re.sub(r"([({\[<]+)(\s+)", r"\1", s)
    # s = re.sub(r"(\s+)([)}\]>]+)", r"\2", s)
    return s

class TranslationConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
    
    def disconnect(self, close_code):
        pass

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        partial_translation = text_data_json['partial_translation']
        original_text = text_data_json['original']
        langspec = text_data_json['langspec'] 

        #Slightly Modified, original code from views.py translate_new
        translatorbest = engines[langspec]["translatorbest"]
        translatorbigram = engines[langspec]["translatorbigram"]
        L1 = toquotapos(original_text.strip())
        L2 = partial_translation
        L2split = L2.split()

        if langspecs[langspec]['indic_code']:
            if L2 != '' and bool(re.search(r"([^\s\u0900-\u097F])", L2[-1])):
                params = {}
                params['inString'] = L2split[-1]
                params['lang'] = 'hindi'
                data = requests.get('http://xlit.quillpad.in/quillpad_backend2/processWordJSON', params = params).json()
                L2split[-1] = data['twords'][0]['options'][0]
                L2 = ' '.join(L2split)
                # L2 = transliterate(L2, sanscript.ITRANS, langspec['indic_code'])
        print(L2)

        _, pred, covatn2d = translatorbest.translate(
            src=[L1],
            tgt=None,
            src_dir='',
            batch_size=30,
            attn_debug=True,
            partial = toquotapos(L2)
            )

        scores, predictions = translatorbigram.translate(
            src=[L1],
            tgt=None,
            src_dir='',
            batch_size=30,
            attn_debug=False,
            partial = toquotapos(L2),
            dymax_len = 2,
            )

        if L2 != '':
            transpattn = [*zip(*covatn2d)]
            attnind = [attn.index(max(attn)) for attn in transpattn]
            attndist = [[ i for i, x in enumerate(attnind) if x==k] for k in range(len(L2.strip().split(" ")))]
            sumattn = [1] * len(L1.split(" "))
            for i in attndist:
                for k in i:
                    sumattn[k] = 0

        else:
            sumattn = [1.00] * len(L1.split(" "))    
        predictions = predictions[0]
        print(predictions)
        seen = set()
        seen_add = seen.add
        sentence = [quotaposto(L2 + x.capitalize()[len(L2):], langspecs[langspec]["tgt"]) + " " for x in predictions if not (x in seen or seen_add(x))]
        # sentence = [x.replace(L2, "") for x in sentence]
        sentence = '\n'.join(sentence)
        if langspecs[langspec]['provide_help'] and L2:
            sentence = quotaposto(L2 + pred[0][0].capitalize()[len(L2):], langspecs[langspec]["tgt"]) + '\n' + L2 + '\n' + sentence
        else:
            sentence = quotaposto(L2 + pred[0][0].capitalize()[len(L2):], langspecs[langspec]["tgt"]) + '\n' + sentence
        
        print(sentence)
        # print(scores)

        self.send(text_data=json.dumps({
            'result': sentence,
            'attn': sumattn,
            'partial': L2
        }))
        return



