import onmt.opts as opts
from onmt.utils.parse import ArgumentParser

import os
import pickle
dir_path = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))

def main():
    parser = ArgumentParser()
    opts.config_opts(parser)
    opts.model_opts(parser)
    opts.global_opts(parser)
    opt = parser.parse_args()
    with open(os.path.join(dir_path, 'opt_data'), 'wb') as f:
        pickle.dump(opt, f)

if __name__ == "__main__":
    main()