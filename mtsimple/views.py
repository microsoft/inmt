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

global corpusops
corpusops = []

def corpus(request):
    return render(request, 'simplecorpus.html')

def translate(request):
    return render(request, 'simpletranslate.html')

def end(request):
    return render(request, 'simpleend.html')

def split_sentences(st):
    #Split sentences based 
    sentences = re.split(r'[!?।|.](?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)', st)
    
    if sentences[-1]:
        return sentences
    else:
        return sentences[:-1]

def corpusinput(request):
    corpusraw = request.POST.get('translate')
    langselect = request.POST.get('langselect')
    if langselect not in langspecs:
        langselect = '*-en'
    request.session["langspec"] = langselect
    s = corpusraw.strip()
    spsent = [k.strip() for k in split_sentences(s)]
    request.session["corpusinps"] = list(filter(lambda elem: elem.strip(), spsent))
    return HttpResponse('Success')

def getinput(request):
    return JsonResponse({'result': request.session["corpusinps"], 'langspec': request.session["langspec"]})

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


