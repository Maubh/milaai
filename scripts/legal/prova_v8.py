from pathlib import Path
import subprocess
r=Path(__file__).resolve().parents[2]
p=r/'app/(site)/privacidade/page.tsx';oauth=Path('/opt/data/profiles/mila/auth/oauth.py')
checks=[('env-production',p,lambda s:s.replace('<h2>9. Por quanto tempo guardamos</h2>','<h2>9. Por quanto tempo guardamos</h2>{process.env.VERCEL ? <p>A guarda acaba sozinha.</p> : null}')),
('client-directive',p,lambda s:'"use client";\n'+s),
('oauth-append',oauth,lambda s:s+'\nPROVIDERS["google"]["scopes"].append("email")\n'),
('oauth-alias',oauth,lambda s:s+'\ns = PROVIDERS["google"]["scopes"]\ns.append("email")\n'),
('oauth-augassign',oauth,lambda s:s+'\nPROVIDERS["google"]["scopes"] += ["email"]\n')]
def run():return subprocess.run(['npm','test'],cwd=r,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True)
assert run().returncode==0,'baseline failed'
for name,path,mut in checks:
    before=path.read_bytes()
    try:
        changed=mut(before.decode());assert changed!=before.decode();path.write_text(changed)
        result=run();assert result.returncode!=0,f'{name}: bypass'
        assert '✖ legal:' in result.stdout,f'{name}: infrastructure failure'
        print('PASS: rejected '+name,flush=True)
    finally:path.write_bytes(before)
assert run().returncode==0,'final baseline failed'
print('PASS: 5/5; baselines clean')
