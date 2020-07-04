from django.http import HttpResponse, JsonResponse
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
import re, os, math
import requests
import pickle

from indic_transliteration import sanscript


from onmt.translate.infertranslator import build_translator
from onmt.utils.parse import ArgumentParser
import mtsimple
dir_path = os.path.dirname(os.path.dirname(mtsimple.__file__))

#TODO: Find a Way to not repeat the below starter code from mtsimple/views.py

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
    # '*-e
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
    #translatorbest builds the best complete translation of the sentence

    opt.n_best = 5
    opt.max_length = 2
    opt.global_attention_function = 'sparsemax'
    ArgumentParser.validate_translate_opts(opt)
    engines[key]["translatorbigram"] = build_translator(opt, report_score=True)
    #translatorbiagram builds best translations of length two

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

@api_view(['GET',])
def translate_new(request):
    langspec = request.GET.get('langspec')
    sentence = request.GET.get('sentence')
    partial_trans = request.GET.get('partial_trans', '')
    translatorbest = engines[langspec]["translatorbest"]
    translatorbigram = engines[langspec]["translatorbigram"]

    L1 = toquotapos(sentence.strip()) 
    L2 = partial_trans 
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


    something, pred, covatn2d, score_total, words_total = translatorbest.translate(
        src=[L1],
        tgt=None,
        src_dir='',
        batch_size=30,
        attn_debug=True,
        partial = toquotapos(L2)
        )

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
        attndist = [[ i for i, x in enumerate(attnind) if x==k] for k in range(len(L2.strip().split(" ")))]
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
    sentence = [quotaposto(L2 + x.capitalize()[len(L2):], langspecs[langspec]["tgt"]) + " " for x in predictions if not (x in seen or seen_add(x))]
    # sentence = [x.replace(L2, "") for x in sentence]
    sentence = '\n'.join(sentence)
    if langspecs[langspec]['provide_help'] and L2:
        sentence = quotaposto(L2 + pred[0][0].capitalize()[len(L2):], langspecs[langspec]["tgt"]) + '\n' + L2 + '\n' + sentence
    else:
        sentence = quotaposto(L2 + pred[0][0].capitalize()[len(L2):], langspecs[langspec]["tgt"]) + '\n' + sentence
    
    perplexity = float(math.exp(-score_total / words_total))
    avg_score = float(score_total / words_total)
    
    print("sentence", sentence)
    return JsonResponse({'result': sentence, 'attn': sumattn, 'partial': L2, 'ppl': perplexity, 'avg': avg_score})

