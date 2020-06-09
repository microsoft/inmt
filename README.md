# Introduction
Interactive Machine Translation app uses Django and jQuery as its tech stack. Please refer to their docs for any doubts.

# Installation Instructions

1. Clone INMT and prepare MT models:
```
git clone https://github.com/microsoft/inmt
```
2. Make a new model folder using `mkdir model` where the models need to be placed. Models can be downloaded from [here](https://microsoftapc-my.sharepoint.com/:f:/g/personal/taganu_microsoft_com/EpG0E6SEqH9Eso4xChI14BQBxGDML3F7ksZ8Ibf1SZI46w?e=SVBmpA). These contain English to Hindi translation models in both directions. If you want to train your own models, refer to [Training MT Models](#training-mt-models)

3. Rest of the installation can be carried out either bare or using docker. Docker is preferable for its ease of installation.

## Docker Installation
Assuming you have docker setup in your system, simply run `docker-compose up -d`. This application requires atleast 4GB of memory in order to run. Allot your docker memory accordingly.

## Bare Installation
1. Install dependencies using - `python -m pip install -r requirements.txt`. Be sure to check your python version. This tool is compatible with Python3.
2. Install OpenNMT dependences using - `cd opennmt & python setup.py install & cd -`
3. Run the migrations and start the server - `python manage.py makemigrations && python manage.py migrate && python manage.py runserver`
4. The server opens on port 8000 by default. Open `localhost:8000/simple` for the simple interface.

## Training MT Models
OpenNMT is used as the translation engine to power INMT. In order to train your own models, you need parallel sentences in your desired language. The basic instructions are listed as follows:
1. Go to opennmt folder: `cd opennmt`
2. Preprocess parallel (src & tgt) sentences: 
```onmt_preprocess -train_src data/src-train.txt -train_tgt data/tgt-train.txt -valid_src data/src-val.txt -valid_tgt data/tgt-val.txt -save_data data/demo```
3. Train your model (with GPUs): 
```onmt_train -data data/demo -save_model demo-model```

For advanced instructions on the training process, refer to [OpenNMT docs](https://opennmt.net/OpenNMT-py/quickstart.html).

# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
