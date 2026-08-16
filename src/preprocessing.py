import pandas as pd
import numpy as np

def load_wisdm(file_path):
    """Parses WISDM formatted text files."""
    df = pd.read_csv(file_path, header=None, names=['subject', 'label', 'timestamp', 'x', 'y', 'z'])
    # Remove the trailing semicolon and convert to float
    df['z'] = df['z'].astype(str).str.replace(';', '').astype(float)
    return df

def get_synchronized_windows(
    acc_df,
    gyr_df,
    activity_label,
    window_size=50,
    step_size=25
):

    sync_windows = []

    # FILTER ACTIVITY
    acc_df = acc_df[acc_df['label'] == activity_label]
    gyr_df = gyr_df[gyr_df['label'] == activity_label]

    # COMMON SUBJECTS
    common_subjects = set(acc_df['subject'].unique()) & set(gyr_df['subject'].unique())

    for sub in common_subjects:

        sub_acc = acc_df[acc_df['subject'] == sub].sort_values('timestamp')

        sub_gyr = gyr_df[gyr_df['subject'] == sub].sort_values('timestamp')

        min_len = min(len(sub_acc), len(sub_gyr))

        for i in range(0, min_len - window_size, step_size):

            acc_w = sub_acc.iloc[i : i + window_size]

            gyr_w = sub_gyr.iloc[i : i + window_size]

            sync_windows.append((acc_w, gyr_w, sub))

    return sync_windows