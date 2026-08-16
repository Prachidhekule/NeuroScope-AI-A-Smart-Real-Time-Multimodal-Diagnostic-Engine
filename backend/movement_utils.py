import numpy as np
import pandas as pd
from scipy.fft import rfft, rfftfreq

def extract_patient_features(
    df_accel,
    df_gyro,
    context_code,
    sampling_rate=50,
    window_size_sec=3
):

    df_accel.columns = df_accel.columns.str.strip()
    df_gyro.columns = df_gyro.columns.str.strip()

    mag_a = np.sqrt(
        df_accel['x']**2 +
        df_accel['y']**2 +
        df_accel['z']**2
    ).values

    mag_g = np.sqrt(
        df_gyro['x']**2 +
        df_gyro['y']**2 +
        df_gyro['z']**2
    ).values

    window_samples = sampling_rate * window_size_sec

    max_iter = min(len(mag_a), len(mag_g)) - window_samples

    features_list = []

    for i in range(0, max_iter, window_samples // 2):

        w_a = mag_a[i:i+window_samples]
        w_g = mag_g[i:i+window_samples]

        mean_a = np.mean(w_a)
        std_a = np.std(w_a)
        rms_a = np.sqrt(np.mean(w_a**2))

        fft_a = np.abs(rfft(w_a))
        freqs_a = rfftfreq(len(w_a), d=1.0/sampling_rate)

        idx_a = np.where(
            (freqs_a >= 4.0) &
            (freqs_a <= 6.0)
        )[0]

        energy_a = np.sum(fft_a[idx_a]**2) / len(w_a)

        mean_g = np.mean(w_g)
        std_g = np.std(w_g)
        rms_g = np.sqrt(np.mean(w_g**2))

        fft_g = np.abs(rfft(w_g))
        freqs_g = rfftfreq(len(w_g), d=1.0/sampling_rate)

        idx_g = np.where(
            (freqs_g >= 4.0) &
            (freqs_g <= 6.0)
        )[0]

        energy_g = np.sum(fft_g[idx_g]**2) / len(w_g)

        features_list.append([
            context_code,
            mean_a,
            std_a,
            rms_a,
            energy_a,
            mean_g,
            std_g,
            rms_g,
            energy_g
        ])

    cols = [
        'context',
        'accel_mean',
        'accel_std',
        'accel_rms',
        'accel_energy',
        'gyro_mean',
        'gyro_std',
        'gyro_rms',
        'gyro_energy'
    ]

    return pd.DataFrame(features_list, columns=cols)