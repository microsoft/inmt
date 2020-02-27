from storages.backends.azure_storage import AzureStorage

class AzureMediaStorage(AzureStorage):
    account_name = 'interactcentral' # Must be replaced by your <storage_account_name>
    account_key = 'rghyseUFCZT1kUqKasqPithOT4hslRDsH+pORAKhGFiswedlBDZEq0KAUvbwFYwLKmRhxhCqbR0Wrl7Ohq0xsg==' # Must be replaced by your <storage_account_key>
    azure_container = 'media'
    expiration_secs = None

class AzureStaticStorage(AzureStorage):
    account_name = 'interactcentral' # Must be replaced by your storage_account_name
    account_key = 'rghyseUFCZT1kUqKasqPithOT4hslRDsH+pORAKhGFiswedlBDZEq0KAUvbwFYwLKmRhxhCqbR0Wrl7Ohq0xsg==' # Must be replaced by your <storage_account_key>
    azure_container = 'static'
    expiration_secs = None