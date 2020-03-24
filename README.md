# Introduction
Interactive Machine Translation app uses Django and jQuery as its tech stack. Please refer to their docs for any doubts.

# Installation Instructions

## Docker Installation
Assuming you have docker setup in your system, simply run `docker-compose up -d`. This application requires atleast 4GB of memory in order to run. Allot your docker memory accordingly.

## Bare Installation
1. Install dependencies using - `python -m pip install -r requirements.txt`. Be sure to check your python version. This tool is compatible with Python3.
2. Make a new model folder using `mkdir model`. Download the models from [https://microsoft-my.sharepoint.com/:f:/p/t-sesan/Evsn3riZxktJuterr5A09lABTVjhaL_NoH430IMgkzws9Q?e=VXzX5T](here) and put it in model folder.
3. Run the server - `python manage.py runserver`
4. The server opens on port 8000 by default. Open `localhost:8000/simple` for the simple interface.


## Keystroke Interface
The keystroke interface is a portal for translations. There is database access required and hence there more processes involved in the setup.

1. `python manage.py makemigrations` - Generates the relational mapping for sql table creation.
2. `python manage.py migrate` - Creates sqlite db and puts tables
3. `python manage.py superuser` - Make a admin user to access the admin interface and handle the keystroke interface. Admin portal can be accessed from `localhost:8000/admin`.

More details about handling Keystroke Interface to follow soon.

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
