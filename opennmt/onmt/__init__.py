""" Main entry point of the ONMT library """
from __future__ import division, print_function

import opennmt.onmt.inputters
import opennmt.onmt.encoders
import opennmt.onmt.decoders
import opennmt.onmt.models
import opennmt.onmt.utils
import opennmt.onmt.modules
from onmt.trainer import Trainer
import sys
import onmt.utils.optimizers
onmt.utils.optimizers.Optim = onmt.utils.optimizers.Optimizer
sys.modules["onmt.Optim"] = onmt.utils.optimizers

# For Flake
__all__ = [onmt.inputters, onmt.encoders, onmt.decoders, onmt.models,
           onmt.utils, onmt.modules, "Trainer"]

__version__ = "1.1.1"
