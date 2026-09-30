from pathlib import Path
import subprocess
r=Path(__file__).resolve().parents[2]
checks=[('env-na-fonte',r/'lib/legal.ts',lambda s:s+'\nexport const AMBIENTE = process.env.VERCEL_ENV;\n'),
('novo-layout',r/'app/(site)/privacidade/layout.tsx',lambda s:'export default function L({children}:any){return <div>{children}<p>Expurgo ativo.</p></div>}'),
('novo-css',r/'app/(site)/hide.css',lambda s:'.legal-body {display:none}'),
('classe-existente',r/'app/(site)/privacidade/page.tsx',lambda s:s.replace('className="legal-body"','className="legal-body sr-only"')),
('python-externo',r/'novo_scope.py',lambda s:'from auth.oauth import PROVIDERS\nPROVIDERS["google"]["scopes"].append("email")\n')]
def run():return subprocess.run(['npm','test'],cwd=r,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True)
assert run().returncode==0
for name,path,mut in checks:
    before=path.read_bytes() if path.exists() else None
    try:
        path.write_text(mut(before.decode() if before is not None else ''))
        result=run();assert result.returncode!=0,name+' bypass'
        assert '✖ legal: conjunto completo' in result.stdout,name+' not caught by source lock'
        print('PASS: rejected '+name,flush=True)
    finally:
        if before is None:path.unlink(missing_ok=True)
        else:path.write_bytes(before)
assert run().returncode==0
print('PASS: 5/5; baselines clean')
