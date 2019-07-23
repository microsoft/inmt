from __future__ import unicode_literals

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
    }
}

# langspec = langspecs['hi-en']
# langspec = langspecs['en-hi']
global langspec
langspec = None

global translatorbest, translatorbigram

# opt.models = [os.path.join(dir_path, 'model', langspec['model'])]

# opt.n_best = 1
# ArgumentParser.validate_translate_opts(opt)
# logger = init_logger(opt.log_file)
# translatorbest = build_translator(opt, report_score=True)

# opt.models = [os.path.join(dir_path, 'model', langspec['model'])]
# opt.n_best = 5
# opt.max_length = 2
# ArgumentParser.validate_translate_opts(opt)
# logger = init_logger(opt.log_file)
# translatorbigram = build_translator(opt, report_score=True)


def quotaposto(s, lang="en"):
    s = re.sub(r"&quot;", r'"', s)
    s = re.sub(r"&apos;", r"'", s)
    #This is work in progress to make writing as natural as possible. taking care of spaces before and after certain characters.
    # s = re.sub(r"(\s+)([!:?,.।\']+)", r"\2", s)
    # s = re.sub(r"([({\[<]+)(\s+)", r"\1", s)
    # s = re.sub(r"(\s+)([)}\]>]+)", r"\2", s)
    return s

def toquotapos(s, lang="en"):
    if lang=="en":
        s = s.lower()
    s = re.sub(r"([\“\”])", r'"', s)
    s = re.sub(r"([\‘\’])", r"'", s)
    s = re.sub(r"([\ः])", r":", s)
    s = re.sub(r"([-!$%^&*()_+|~=`{}\[\]:\";<>?,.\/#@।]+)", r" \1 ", s)
    s = re.sub(r'"', r'&quot;', s)
    s = re.sub(r"'", r"&apos;", s)
    s = re.sub(r"(\s+)", r" ", s)
    return s


def prepare_translators(langspecf):
    global translatorbest, translatorbigram, langspec
    with open(os.path.join(dir_path, 'opt_data'), 'rb') as f:
        opt = pickle.load(f)

    if not langspec or langspec != langspecf:
        opt.models = [os.path.join(dir_path, 'model', langspecf['model'])]
        opt.n_best = 1
        ArgumentParser.validate_translate_opts(opt)
        logger = init_logger(opt.log_file)
        translatorbest = build_translator(opt, report_score=True)

        opt.models = [os.path.join(dir_path, 'model', langspecf['model'])]
        opt.n_best = 5
        opt.max_length = 2
        ArgumentParser.validate_translate_opts(opt)
        logger = init_logger(opt.log_file)
        translatorbigram = build_translator(opt, report_score=True)

        langspec = langspecf

global corpusinps, corpusid, corpusops, translatedsetid
corpusinps = []
corpusops = []
corpusid = 0
translatedsetid = 0

# Split sentence if it is too long
 
# def checksenlen(st):
#     MAX_LEN = 10
#     for i in st

def corpus(request):
    return render(request, 'paracorpus.html')

def translate(request):
    return render(request, 'paratranslate.html')

def end(request):
    return render(request, 'paraend.html')

def split_sentences(st):
    #Split sentences based 
    sentences = re.split(r'[!?।|.](?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)', st)
    
    if sentences[-1]:
        return sentences
    else:
        return sentences[:-1]

def corpusinput(request):
    global corpusinps
    corpusraw = request.POST.get('translate')
    langselect = request.POST.get('langselect')
    prepare_translators(langspecs[langselect])
    s = corpusraw.strip()
    corpusinps = list(filter(lambda elem: elem.strip(), split_sentences(s)))
    print(corpusinps)
    return HttpResponse('Success')

def getinput(request):
    global corpusinps
    return JsonResponse({'result': corpusinps})

def translate_new(request):
    global translatorbest, translatorbigram
    L1 = toquotapos(request.GET.get('a').strip(), langspec["src"])
    L2 = request.GET.get('b', "")
    L2split = L2.split()

    if langspec['indic_code']:
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
        partial = toquotapos(L2, langspec["tgt"])
        )

    scores, predictions = translatorbigram.translate(
        src=[L1],
        tgt=None,
        src_dir='',
        batch_size=30,
        attn_debug=False,
        partial = toquotapos(L2, langspec["tgt"]),
        dymax_len = 2,
        )


    # print(covatn2d)
    if L2 != '':
        attn = covatn2d[:len(L2.strip().split(" "))]
        sumattn = [sum(i) for i in zip(*attn)]
        for i in range(len(attn)):
            if max(attn[i]) > 0.30:
                sumattn[attn[i].index(max(attn[i]))] = 1
            print(max(attn[i]))
        newattn = [float("{0:.2f}".format(1-(k/max(sumattn)))) for k in sumattn]
        # sumattn = [float("{0:.2f}".format(k/sum(newattn))) for k in newattn]
        newattn = [ 1.66*max(0, (k-0.4)) for k in newattn]
        sumattn = newattn
    else:
        sumattn = [1.00] * len(L1.split(" "))    
    predictions = predictions[0]
    print(predictions)
    seen = set()
    seen_add = seen.add
    sentence = [quotaposto(L2 + x.capitalize()[len(L2):], langspec["tgt"]) + " " for x in predictions if not (x in seen or seen_add(x))]
    # sentence = [x.replace(L2, "") for x in sentence]
    sentence = '\n'.join(sentence)
    if langspec['provide_help'] and L2:
        sentence = quotaposto(L2 + pred[0][0].capitalize()[len(L2):], langspec["tgt"]) + '\n' + L2 + '\n' + sentence
    else:
        sentence = quotaposto(L2 + pred[0][0].capitalize()[len(L2):], langspec["tgt"]) + '\n' + sentence
    
    print(sentence)
    # print(scores)
    return JsonResponse({'result': sentence, 'attn': sumattn, 'partial': L2})

def pushoutput(request):
    global corpusops
    corpusops = ast.literal_eval((request.GET.get('ops')))
    print(corpusops)
    return JsonResponse({'result': corpusops})

def getoutput(request):
    global corpusops
    return JsonResponse({'result': corpusops})


def indic(request):
    params = {}
    params['inString'] = request.GET.get('inString')
    params['lang'] = request.GET.get('lang')
    data = requests.get('http://xlit.quillpad.in/quillpad_backend2/processWordJSON', params = params).json()
    return JsonResponse(data)