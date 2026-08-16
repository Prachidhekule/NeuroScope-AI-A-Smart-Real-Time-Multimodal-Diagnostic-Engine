from sklearn.model_selection import LeaveOneGroupOut
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report

def run_loso_evaluation(X, y, groups):
    logo = LeaveOneGroupOut()
    model = RandomForestClassifier(n_estimators=200, class_weight='balanced', random_state=42)
    
    y_true, y_pred = [], []
    
    for train_idx, test_idx in logo.split(X, y, groups):
        model.fit(X.iloc[train_idx], y[train_idx])
        y_true.extend(y[test_idx])
        y_pred.extend(model.predict(X.iloc[test_idx]))
        
    print(classification_report(y_true, y_pred))
    return model