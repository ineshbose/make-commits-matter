import requests


THESHOLD = 10

def commit_matters(repo, commit):
    return requests.get(f'https://api.github.com/repos/{repo}/commits/{commit}').json()["stats"]["total"] >= THESHOLD


def commits(repo):
    for commit in requests.get(f'https://api.github.com/repos/{repo}/commits').json():
        yield commit["sha"]


def evaluate(repo):
    return len((commit for commit in commits(repo) if commit_matters(repo, commit)))


if __name__ == "__main__":
    print(f'{evaluate(input("Enter <username>/<repo>: "))} commits matter.')