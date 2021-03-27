const https = require('https');
const readline = require('readline');

const args = process.argv.slice(2);
var repo = null;
var threshold = null;

function takeInput(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
}

async function setValues() {
    repo = args[0] ? args[0] : await takeInput("Enter: <username>/<repo>: ");
    threshold = args[1] ? parseInt(args[1]) : 10;
}

async function evaluateCommits(commits) {
    return new Promise(resolve => {
        var matterCommits = [];
        var promises = commits.map(commit => {
            const options = {
                hostname: 'api.github.com',
                path: `/repos/${repo}/commits/${commit.sha}`,
                method: 'GET',
                headers: { 'User-Agent': 'request' }
            };
            return new Promise(resolve => {
                https.get(options, res => {
                    var data = '';
                    res.on('data', d => data += d);
                    res.on('end', () => {
                        var commitInfo = JSON.parse(data);
                        if (commitInfo.stats && commitInfo.stats.total >= threshold) {
                            matterCommits.push(commit);
                        }
                        resolve();
                    });
                }).on('error', e => console.log(e));
            });
        });
        Promise.all(promises).then(() => resolve(matterCommits.length));
    }).catch(e => console.log(e, commits));
}

async function fetchCommits() {
    return new Promise(resolve => {
        const options = {
            hostname: 'api.github.com',
            path: `/repos/${repo}/commits`,
            method: 'GET',
            headers: { 'User-Agent': 'request' }
        };
        https.get(options, res => {
            var data = '';
            res.on('data', d => data += d);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', e => console.log(e));
    });
}

setValues().then(() => fetchCommits().then(commits => evaluateCommits(commits).then(res => console.log(`${res} commits matter.`))));