from django.shortcuts import render
from django.http import HttpResponse, JsonResponse

from .models import *

import json

import re
import ast

import sys
import os
dir_path = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
sys.path.insert(0, os.path.join(dir_path, 'opennmt'))

from onmt.utils.logging import init_logger
from onmt.utils.misc import split_corpus
from onmt.translate.infertranslator import build_translator

import onmt.opts as opts
from onmt.utils.parse import ArgumentParser

import pickle

from indic_transliteration import sanscript
from indic_transliteration.sanscript import SchemeMap, SCHEMES, transliterate

import requests

import math

# defines the configuration of the translation type selected by the user
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

    'hi-gondi' : {
        'src' : 'hi',
        'tgt' : 'gondi',
        'model': 'hi-gondi.pt',
        'indic_code': sanscript.DEVANAGARI,
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

global langspec
langspec = None

global translatorbest, translatorbigram

def quotaposto(s, lang="en"):
    s = re.sub(r"&quot;", r'"', s)
    s = re.sub(r"&apos;", r"'", s)
    s = re.sub(r"(@@ )|(@@ ?$)", r"", s)
    #This is work in progress to make writing as natural as possible. taking care of spaces before and after certain characters.
    # s = re.sub(r"(\s+)([!:?,.।\']+)", r"\2", s)
    # s = re.sub(r"([({\[<]+)(\s+)", r"\1", s)
    # s = re.sub(r"(\s+)([)}\]>]+)", r"\2", s)
    return s

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

with open(os.path.join(dir_path, 'opt_data'), 'rb') as f:
        opt = pickle.load(f)

engines = {}
# The model engines are initialised here after loading opt (maybe it just specifies of how the model looks like?)
for key, value in langspecs.items():
    opt.models = [os.path.join(dir_path, 'model', value['model'])]
    opt.n_best = 1
    opt.max_length = 100
    opt.global_attention_function = 'sparsemax'
    ArgumentParser.validate_translate_opts(opt)
    engines[key] = {"translatorbest": build_translator(opt, report_score=True)}
    #translatorbest builds the best complete translation of the sentence

    opt.n_best = 5
    opt.max_length = 2
    opt.global_attention_function = 'sparsemax'
    ArgumentParser.validate_translate_opts(opt)
    engines[key]["translatorbigram"] = build_translator(opt, report_score=True)
    #translatorbiagram builds 5 best translations of length two

global corpusops
corpusops = []

# The view function for the first page url : simple/
def corpus(request):
    return render(request, 'simplecorpus.html')

#The view function called after setting languagespecs and getting the input in simple/ (called after corpusinput)
def translate(request):
    return render(request, 'simpletranslate.html')

def end(request):
    return render(request, 'simpleend.html')

def split_sentences(st):
    #Split sentences based on !?।|.
    sentences = re.split(r'[!?।|.](?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)', st)
    
    if sentences[-1]:
        return sentences
    else:
        return sentences[:-1]

""" 
The view function for getting the input for translation on the first page (simple/)

Splits the sentence based on !?।| cleans it and saves the list in session["corpusinps"]
"""

def corpusinput(request):
    corpusraw = request.POST.get('translate')
    langselect = request.POST.get('langselect')
    if langselect not in langspecs:
        langselect = '*-en'
    request.session["langspec"] = langselect
    print(request.session["langspec"])
    s = corpusraw.strip()

    print(s, "DEBUG: raw corpus before split_sentences")
    spsent = [k.strip() for k in split_sentences(s)]
    print(spsent, "DEBUG: raw corpus after split_sentences")

    corpusinps = list(filter(lambda elem: elem.strip(), spsent))
    request.session["corpusinps"] = [[k, ''] for k in corpusinps]
    print(request.session["corpusinps"])
    return HttpResponse('Success')

def getinput(request):
    print(request.session["corpusinps"])
    return JsonResponse({'result': request.session["corpusinps"], 'langspec': request.session["langspec"]})

def pushoutput(request):
    global corpusops
    corpusops = ast.literal_eval((request.POST.get('ops')))
    print(corpusops)
    return HttpResponse('Success')

def getoutput(request):
    global corpusops
    return JsonResponse({'result': corpusops})


def indic(request):
    params = {}
    params['inString'] = request.GET.get('inString')
    params['lang'] = request.GET.get('lang')
    data = requests.get('http://xlit.quillpad.in/quillpad_backend2/processWordJSON', params = params).json()
    return JsonResponse(data)

def translate_new(request):
    translatorbest = engines[request.session["langspec"]]["translatorbest"]
    translatorbigram = engines[request.session["langspec"]]["translatorbigram"]
    print("Before processing")
    print("##########################")
    print("##########################")
    print(request.GET.get('a').strip())
    print("##########################")
    print("##########################")
    print("##########################")

    L1 = toquotapos(request.GET.get('a').strip()) # request.GET.get('a') contains the whole sentence to be translated
    print("############After Processing########")
    print((L1))
    L2 = request.GET.get('b', "") # request.GET.get('b') contains the partial sentence to be translated
    L2split = L2.split()

    if langspecs[request.session["langspec"]]['indic_code']:
        # print(L2[-1])
        if L2 != '' and bool(re.search(r"([^\s\u0900-\u097F])", L2[-1])):
            params = {}
            params['inString'] = L2split[-1]
            params['lang'] = 'hindi'
            data = requests.get('http://xlit.quillpad.in/quillpad_backend2/processWordJSON', params = params).json()
            L2split[-1] = data['twords'][0]['options'][0]
            L2 = ' '.join(L2split)
            # L2 = transliterate(L2, sanscript.ITRANS, langspec['indic_code'])

    print(L2, u'\u0900-\u097F')

    something, pred, covatn2d, score_total, words_total = translatorbest.translate(
        src=[L1],
        tgt=None,
        src_dir='',
        batch_size=30,
        attn_debug=True,
        partial = toquotapos(L2)
        )
    
    print("$$$$$$$$$$$$$$$$$$$$$$$$")

    scores, predictions, score_total, words_total = translatorbigram.translate(
        src=[L1],
        tgt=None,
        src_dir='',
        batch_size=30,
        attn_debug=False,
        partial = toquotapos(L2),
        dymax_len = 2,
        )


    print(covatn2d, 'convatn2d')
    if L2 != '':
        transpattn = [*zip(*covatn2d)]
        attnind = [attn.index(max(attn)) for attn in transpattn]
        print('attnind', attnind)
        attndist = [[ i for i, x in enumerate(attnind) if x==k] for k in range(len(L2.strip().split(" ")))]
        print('attndist', attndist)
        sumattn = [1] * len(L1.split(" "))
        for i in attndist:
            for k in i:
                sumattn[k] = 0
        # attn = covatn2d[:len(L2.strip().split(" "))]
        # sumattn = [sum(i) for i in zip(*attn)]
        # for i in range(len(attn)):
        #     if max(attn[i]) > 0.30:
        #         sumattn[attn[i].index(max(attn[i]))] = 1
        #     print(max(attn[i]))
        # newattn = [float("{0:.2f}".format(1-(k/max(sumattn)))) for k in sumattn]
        # # sumattn = [float("{0:.2f}".format(k/sum(newattn))) for k in newattn]
        # newattn = [ 1.66*max(0, (k-0.4)) for k in newattn]

    else:
        sumattn = [1.00] * len(L1.split(" "))    
    predictions = predictions[0]
    print(predictions)
    seen = set()
    seen_add = seen.add
    sentence = [quotaposto(L2 + x.capitalize()[len(L2):], langspecs[request.session["langspec"]]["tgt"]) + " " for x in predictions if not (x in seen or seen_add(x))]
    # sentence = [x.replace(L2, "") for x in sentence]
    sentence = '\n'.join(sentence)
    print("pred[0][0]", pred[0][0], pred[0][0][len(L2):])
    if langspecs[request.session["langspec"]]['provide_help'] and L2:
        sentence = quotaposto(L2 + pred[0][0].capitalize()[len(L2):], langspecs[request.session["langspec"]]["tgt"]) + '\n' + L2 + '\n' + sentence
    else:
        sentence = quotaposto(L2 + pred[0][0].capitalize()[len(L2):], langspecs[request.session["langspec"]]["tgt"]) + '\n' + sentence
    
    print(sentence)
    perplexity = float(math.exp(-score_total / words_total))
    avg_score = float(score_total / words_total)
    print("sentence", sentence)
    # print(something, pred)
    return JsonResponse({'result': sentence, 'attn': sumattn, 'partial': L2, 'ppl': perplexity, 'avg': avg_score})
