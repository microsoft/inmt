from __future__ import unicode_literals

from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.decorators import login_required

import torch
from torch.nn import functional as F
from pytorch_pretrained_bert import GPT2Tokenizer, GPT2LMHeadModel

import copy

tokenizer = GPT2Tokenizer.from_pretrained('gpt2')
model = GPT2LMHeadModel.from_pretrained('gpt2')

beam = 5

def home(request):
    return render(request, 'gpt.html')

def follow(request):
    textinp = request.POST.get('text')
    if textinp:
        text = tokenizer.encode(textinp)
        beamse = []
        if textinp[-1] == " ":
            while (len(beamse) < beam):
                sugg = ''
                input, past = torch.tensor([text]), None
                for __ in range(3):
                    logits, past = model(input, past=past)
                    input = torch.multinomial(F.softmax(logits[:, -1]), 1)
                    
                    sugg += tokenizer.decode([input.item()])
                beamse.append(sugg.lstrip())
        else:
            while (len(beamse) < beam):
                sugg = ''
                input, past = torch.tensor([text]), None
                for __ in range(4):
                    logits, past = model(input, past=past)
                    input = torch.multinomial(F.softmax(logits[:, -1]), 1)
                    
                    sugg += tokenizer.decode([input.item()])
                beamse.append(sugg)


        # newt = copy.copy(text)
        # ele = ''
        # while ('.' not in ele):
        #     logits, past = model(input, past=past)
        #     input = torch.multinomial(F.softmax(logits[:, -1]), 1)
        #     ele = tokenizer.decode([input.item()])
        #     newt.append(input.item())
        # newt = tokenizer.decode(newt)
        sentence = '\n'.join(beamse)
        # sentence += newt + '\n' + sentence
        print(sentence)
        return JsonResponse({'result': sentence, 'partial': textinp})
    else:
        return JsonResponse({'result': '', 'partial': ''})