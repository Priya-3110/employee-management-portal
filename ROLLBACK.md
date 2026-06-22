# Rollback and Restore Guide

This file provides reference information and commands to toggle between the clean original state (before the features were added) and the newly added features version.

## Commit Hashes

- **Checkpoint Commit Hash (Original State)**:
  `64080d59c2064a23461f6722adbe746e16ba3a8e`
- **Feature Commit Hash (New Feature State)**:
  `edc4b8a9aaa8fc04adcb9c1590f340f0921a6e06`

---

## 1. Restore Original Version (Rollback)

To return to the clean state before recommendation and availability tracking features were implemented, execute one of the following procedures:

### Option A: Check out the original `main` branch
Since the checkpoint commit is the root of the `main` branch, simply switching back to `main` will restore the original state:
```bash
git checkout main
```

### Option B: Hard Reset the current branch
If you want to discard the new features on the current branch entirely and go back to the checkpoint commit:
```bash
git reset --hard 64080d59c2064a23461f6722adbe746e16ba3a8e
```

---

## 2. Restore Feature Version

To return back to the implemented feature state from the original state:

### Option A: Check out the feature branch
```bash
git checkout feature/employee-recommendation-availability
```

### Option B: Hard Reset to the feature commit
If you ran a reset and want to move forward to the exact commit where features are implemented:
```bash
git reset --hard edc4b8a9aaa8fc04adcb9c1590f340f0921a6e06
```
