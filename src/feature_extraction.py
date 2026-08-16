import numpy as np
import pandas as pd
from scipy.fft import fft, fftfreq

def extract_combined_features(acc_win, gyr_win, fs=20):
    """Extracts features from both sensors to find Parkinsonian tremors."""
    feats = {}
    # Combine signals into a dictionary for iteration
    sensors = {'acc': acc_win, 'gyr': gyr_win}
    
    for sensor_name, window in sensors.items():
        for axis in ['x', 'y', 'z']:
            sig = window[axis].values
            n = len(sig)
            
            # Time Domain: Basic intensity
            feats[f'{sensor_name}_{axis}_std'] = np.std(sig)
            
            # Frequency Domain (FFT): Identifying the 4-6Hz Tremor
            # We take the absolute value of the FFT and only the positive frequencies
            yf = np.abs(fft(sig))[:n//2]
            xf = fftfreq(n, 1/fs)[:n//2]
            
            # Clinical Target: Tremor Band (4-6Hz)
            tremor_mask = (xf >= 4) & (xf <= 6)
            feats[f'{sensor_name}_{axis}_tremor_pwr'] = np.sum(yf[tremor_mask]**2)
            feats[f'{sensor_name}_{axis}_peak_freq'] = xf[np.argmax(yf)]
            
    return pd.Series(feats)