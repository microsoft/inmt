from django.db import models
from django.contrib.auth.models import User
from jsonfield import JSONField

import re

from nltk.tokenize import word_tokenize

def split_sentences(st):
    #Split sentences based 
    sentences = re.split(r'[!?।|.](?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)', st)
    
    if sentences[-1]:
        return sentences
    else:
        return sentences[:-1]

class language(models.Model):
    name = models.CharField(max_length = 30)
    code = models.CharField(max_length = 2)

    class Meta:
        verbose_name = "Language"
        verbose_name_plural = "1. Languages"

    def __str__(self):
        return self.name

class langtolang(models.Model):
    src = models.ForeignKey(language, on_delete = models.CASCADE, related_name="srclang")
    tgt = models.ForeignKey(language, on_delete = models.CASCADE, related_name="tgtlang")

    class Meta:
        verbose_name = "Language to Language Link"
        verbose_name_plural = "2. Language to Language Links"
        unique_together = (("src", "tgt"))

    def __str__(self):
        return self.src.name + " -> " + self.tgt.name

class translator(models.Model):
    user = models.OneToOneField(User, on_delete = models.CASCADE, related_name="translator")
    name = models.CharField(max_length = 120)
    gender = models.CharField(max_length = 1)
    dob = models.DateField()
    updatedtime = models.DateTimeField(auto_now_add=False, auto_now=True)
    settime = models.DateTimeField(auto_now_add=True, auto_now=False)

    class Meta:
        verbose_name = "Translator Identity"
        verbose_name_plural = "3. Translator Identities"

    def __str__(self):
        return self.name

class translatorlangs(models.Model):
    translator = models.ForeignKey(translator, on_delete = models.CASCADE, related_name="translatorlangs")
    langtolang = models.ForeignKey(langtolang, on_delete = models.CASCADE, related_name="translatorlangs")

    class Meta:
        verbose_name = "Translator Language Possible"
        verbose_name_plural = "4. Translator Languages Possible"
        unique_together = (("translator", "langtolang"))

    def __str__(self):
        return self.translator.name + " | " + self.langtolang.__str__()

translation_types = [
    ('IT', 'Interactive Translation'),
    ('PE', 'Post Editing'),
    ('BL', 'Baseline')
]

class corpus(models.Model):
    user = models.ForeignKey(User, on_delete = models.CASCADE)
    name = models.CharField(max_length=120)
    corpus = models.TextField()
    baselang = models.ForeignKey(language, on_delete = models.CASCADE)
    # helpprovision = models.BooleanField()

    __original_corpus = None

    def __init__(self, *args, **kwargs):
        super(corpus, self).__init__(*args, **kwargs)
        self.__original_corpus = self.corpus

    def save(self, *args, **kwargs):
        super(corpus, self).save(*args, **kwargs)
        
        if self.corpus != self.__original_corpus:
            corpusdivide.objects.filter(corpus=self).delete()
            if '\n' in self.corpus and self.baselang.code == "en":
                s = self.corpus.strip()
                s = re.sub(r"([\“\”])", r'"', s)
                s = re.sub(r"([\‘\’])", r"'", s)
                s = re.sub(r"([\ः])", r":", s)
                corpusinps = s.split('\n')
                for i in corpusinps:
                    sent = word_tokenize(i.strip())
                    flagq = (sent[-1] == "''")
                    sent = ' '.join(sent)
                    sent = sent.replace('``', '')
                    if flagq:
                        sent = sent.replace("''", '')
                    else:
                        sent = sent.replace("''", ',')
                    corpusdivide(corpus=self, src=sent.strip()).save()
            else:
                s = self.corpus.strip()
                if self.baselang.code == "en":
                    s = s.lower()
                s = re.sub(r"([\“\”])", r'"', s)
                s = re.sub(r"([\‘\’])", r"'", s)
                s = re.sub(r"([\ः])", r":", s)
                s = re.sub(r"([-!$%^&*()_+|~=`{}\[\]:\";<>?,.\/#@।]+)", r" \1 ", s)
                s = re.sub(r"([\"])", r"&quot;", s)
                s = re.sub(r"([\'])", r" &apos;", s)
                s = re.sub(r"(\s+)", r" ", s)
                corpusinps = list(filter(lambda elem: elem.strip(), split_sentences(s)))

                for i in corpusinps:
                    corpusdivide(corpus=self, src=i.strip()).save()

    class Meta:
        verbose_name = "Corpus Identity"
        verbose_name_plural = "5. Corpus Identities"

    def __str__(self):
        return self.name + " | " + self.baselang.__str__()

class corpusdivide(models.Model):
    corpus = models.ForeignKey(corpus, on_delete = models.CASCADE, related_name="corpusdivide")
    src = models.CharField(max_length=200)

    class Meta:
        verbose_name = "Corpus Tokenized (Automatic)"
        verbose_name_plural = "Corpus Tokenized (Automatic)"

    def __str__(self):
        return self.corpus.name + " | " + self.src
    
class corpusLangReq(models.Model):
    corpus = models.ForeignKey(corpus, on_delete = models.CASCADE, related_name="corpuslangreqs")
    langtolang = models.ForeignKey(langtolang, on_delete=models.CASCADE)

    class Meta:
        verbose_name = "Corpus Language Required"
        verbose_name_plural = "6. Corpus Languages Required"
        unique_together = (("corpus", "langtolang"))

    def __str__(self):
        return self.corpus.name + " | " + self.langtolang.__str__()


class translatorcorpus(models.Model):
    translator = models.ForeignKey(translator, on_delete = models.CASCADE, related_name="translatorcorpus")
    corpus = models.ForeignKey(corpus, on_delete = models.CASCADE, related_name="corpustranslators")
    helpprovision = models.CharField(max_length=2, choices=translation_types, default='IT')

    class Meta:
        verbose_name = "Translator Corpus Possible"
        verbose_name_plural = "6. Translator Corpus Possible"
        unique_together = (("translator", "corpus"))

    def __str__(self):
        return self.translator.name + " | " + self.corpus.name + " | " + self.helpprovision


class translatedSet(models.Model):
    user = models.ForeignKey(User, on_delete = models.CASCADE)
    corpus = models.ForeignKey(corpus, on_delete = models.CASCADE)
    langtolang = models.ForeignKey(langtolang, on_delete=models.CASCADE)

    class Meta:
        verbose_name = "Translated Set (linking pairs together) by Users (Automatic)"
        verbose_name_plural = "Translated Set (linking pairs together) by User (Automatic)"
        unique_together = (("user", "corpus", "langtolang"))

    def __str__(self):
        return self.user.translator.name + " | " + self.corpus.name + " | " + self.langtolang.__str__()

class translatedSentence(models.Model):
    translatedSet = models.ForeignKey(translatedSet, on_delete = models.CASCADE)
    src = models.CharField(max_length=200)
    tgt = models.CharField(max_length=200)

    class Meta:
        verbose_name = "Translated Pairs by Users (Automatic)"
        verbose_name_plural = "Translated Pair by User (Automatic)"
        unique_together = ("translatedSet", "src")

    def __str__(self):
        return self.translatedSet.corpus.name + " | " + self.translatedSet.user.username + "|" + self.src


class dockeystroke(models.Model):
    translatedSet = models.ForeignKey(translatedSet, on_delete = models.CASCADE)
    keystrokeseries = JSONField()
    submittime = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Keystroke Time Series over the Document (Automatic)"
        verbose_name_plural = "Keystroke Time Series over the Document (Automatic)"

    def __str__(self):
        return self.translatedSet.corpus.name + " | " + self.translatedSet.user.username + " | " + str(self.submittime)

class keystrokes(models.Model):
    translatedSentence = models.OneToOneField(translatedSentence, on_delete = models.CASCADE)
    tab = models.IntegerField(null=True)
    enter = models.IntegerField(null=True)
    up = models.IntegerField(null=True)
    down = models.IntegerField(null=True)
    space = models.IntegerField(null=True)
    atoz = models.IntegerField(null=True)
    pgdn = models.IntegerField(null=True)
    pgup = models.IntegerField(null=True)
    right = models.IntegerField(null=True)
    left = models.IntegerField(null=True)
    bkspc = models.IntegerField(null=True)
    end = models.IntegerField(null=True)
    others = models.IntegerField(null=True)

    class Meta:
        verbose_name = "Keystroke Collection (Automatic)"
        verbose_name_plural = "Keystroke Collection (Automatic)"

    # def __str__(self):
    #     return self.time

class time(models.Model):
    translatedSentence = models.OneToOneField(translatedSentence, on_delete = models.CASCADE)
    thinktime = models.IntegerField()
    writetime = models.IntegerField()

    class Meta:
        verbose_name = "Time Data Collection (Automatic)"
        verbose_name_plural = "Time Data Collection (Automatic)"

    # def __str__(self):
    
#Ok, so it's possible for the model to be updated automatically in the code. I would like to see how the time model is updated in the code!
class customKeyboardCommands(models.Model):
    select_entire_suggestion = models.IntegerField()
    select_single_word_from_suggestion = models.IntegerField()
    navigate_to_next_corpus_fragment = models.IntegerField()
    navigate_to_previous_corpus_fragment = models.IntegerField()
    submit_translation = models.IntegerField()
    select_next_translation_suggestion = models.IntegerField()
    select_previous_translation_suggestion = models.IntegerField()
    custom_layout_name = models.CharField(max_length=30)

    class Meta: 
        verbose_name = "Custom Keyboard Command Set"
        verbose_name_plural = "Custom Keyboard Command Sets"

    def __str__(self):
        return self.custom_layout_name

class translatorKeyboardLayouts(models.Model):
    translator = models.ForeignKey(translator, on_delete = models.CASCADE, related_name="translatorconfigs")
    customKeyboardCommands = models.ForeignKey(customKeyboardCommands, on_delete = models.CASCADE, related_name="translatorconfigs")

    class Meta:
        verbose_name = "Translator Keyboard Layout Specified"
        verbose_name_plural = "Translator Keyboard Layout Specified"
        unique_together = (("translator", "customKeyboardCommands"))

    def __str__(self):
        return self.translator.name + " | " + self.customKeyboardCommands.__str__()