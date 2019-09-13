#Introduction
Interactive Machine Translation app uses Django and jQuery as its tech stack. Please refer to their docs for any doubts.

# Installation Instructions
1. Generate your access keys from your profile settings (click on top right and go to security) for ELLORA.
2. Clone the repository locally `git clone https://dev.azure.com/ELLORA/_git/Interactive%20Machine%20Translation inmt`. Username is your microsoft email address, password is your access key.
3. Install dependencies using - `python -m pip install -r requirements.txt`. Be sure to check your python version. This tool is compatible with Python3.
4. Make a new model folder using `mkdir model`. Download the models from [https://microsoft-my.sharepoint.com/:f:/p/t-sesan/Evsn3riZxktJuterr5A09lABTVjhaL_NoH430IMgkzws9Q?e=VXzX5T](here) and put it in model folder.
5. Run the server - `python manage.py runserver`
6. The server opens on port 8000 by default. Open `localhost:8000/simple` for the simple interface.


## Keystroke Interface
The keystroke interface is a portal for translations. There is database access required and hence there more processes involved in the setup.

1. `python manage.py makemigrations` - Generates the relational mapping for sql table creation.
2. `python manage.py migrate` - Creates sqlite db and puts tables
3. `python manage.py superuser` - Make a admin user to access the admin interface and handle the keystroke interface. Admin portal can be accessed from `localhost:8000/admin`.

More details about handling Keystroke Interface to follow soon.