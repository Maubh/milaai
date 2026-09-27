import Link from "next/link";

export const metadata = {
  title: "Termos de uso — mila.",
  description:
    "Termos de uso do piloto da mila.: WhatsApp, site, responsabilidades e limites.",
};

export default function TermosPage() {
  return (
    <div className="wrap auth-minimal">
      <p className="auth-minimal-back auth-minimal-back-top">
        <Link href="/login">← Voltar</Link>
      </p>
      <h1 className="auth-minimal-title">Termos de uso</h1>
      <p className="auth-minimal-lede">
        Regras do piloto da mila. — assistente de negócios no WhatsApp para
        lojas de joias e semijoias. Última atualização: 27 de setembro de 2026.
      </p>
      <div className="legal-body">
        <h2>1. Aceite</h2>
        <p>
          Ao acessar milaai.com.br, solicitar código de verificação, usar o
          WhatsApp da mila. ou o workspace, você concorda com estes termos e com
          a <Link href="/privacidade">política de privacidade</Link>. Se não
          concordar, não use o serviço.
        </p>

        <h2>2. O que é a mila.</h2>
        <p>
          A mila. é uma assistente operacional: você envia foto, nota ou
          pergunta e recebe apoio de precificação, leitura de custos, organização
          e rascunhos de conteúdo. O canal principal é o{" "}
          <strong>WhatsApp</strong>. O site e o workspace são apoio (login,
          status de plano e conectores).
        </p>
        <p>
          Neste momento o serviço opera em <strong>piloto / prévia</strong>. O
          acesso é restrito a números autorizados. Recursos marcados como “em
          breve” ou demonstrativos não devem ser tratados como funcionalidade
          ativa.
        </p>

        <h2>3. Conta e elegibilidade</h2>
        <ul>
          <li>Você declara ter 18 anos ou mais e capacidade para contratar.</li>
          <li>
            Se usa a mila. em nome de uma loja, declara ter autorização para
            vincular o número e, quando existirem, os conectores dessa loja.
          </li>
          <li>
            Você é responsável por quem tem acesso ao WhatsApp e ao workspace
            ligados à sua conta.
          </li>
        </ul>

        <h2>4. Entradas, saídas e ações</h2>
        <p>
          Você pode enviar textos, imagens e arquivos (“entradas”). A mila. pode
          gerar respostas (“saídas”) e, quando um conector estiver disponível e
          você autorizar — com confirmação quando exigirmos — executar ações nas
          ferramentas conectadas.
        </p>
        <ul>
          <li>
            Você garante ter direito de enviar o conteúdo e de autorizar o uso
            das contas conectadas.
          </li>
          <li>
            Saídas de IA podem conter erros. Não use preço, estoque, prazo ou
            texto gerado sem revisão humana quando isso importar para a sua
            loja.
          </li>
          <li>
            Quando esse controle estiver disponível e houver ações que alteram
            dados, pediremos confirmação ligada à prévia da ação. Um “sim”
            solto no chat sobre outro assunto não conta como autorização.
          </li>
          <li>
            Conteúdo do mockup do site e da rota de conversa simulada é
            ilustrativo — não é orientação real de preço.
          </li>
        </ul>

        <h2>5. Planos e pagamento</h2>
        <p>
          Os planos publicados no site (por exemplo Essencial e Pro) descrevem a
          intenção comercial do produto. No piloto, founders e convidados podem
          ter acesso sem cobrança ou em condições especiais. Quando a cobrança
          estiver ativa, preços, ciclo e cancelamento serão confirmados no
          checkout ou no WhatsApp antes da cobrança.
        </p>

        <h2>6. Uso aceitável</h2>
        <p>Você se compromete a não:</p>
        <ul>
          <li>violar lei, direito de terceiros ou estes termos;</li>
          <li>
            tentar acessar conta, dados ou loja de outra pessoa sem autorização;
          </li>
          <li>
            contornar a lista de números autorizados, o código de verificação,
            limites de tentativa ou proteções anti-abuso;
          </li>
          <li>
            enviar malware, spam ou conteúdo ilícito pelo canal da mila.;
          </li>
          <li>
            usar saídas da mila. para treinar ou destilar modelos concorrentes de
            forma abusiva;
          </li>
          <li>
            sobrecarregar de propósito a infraestrutura ou fazer engenharia
            reversa indevida do serviço.
          </li>
        </ul>

        <h2>7. Integrações de terceiros</h2>
        <p>
          Conectores (Google, Notion, Jueri, Olist, Bling etc.), quando
          disponíveis, são serviços de terceiros. Ao conectar, você autoriza a
          mila. a agir nos limites da permissão concedida e aceita os termos
          desses provedores. A mila. não controla indisponibilidade, mudança de
          API ou políticas deles. Itens “em breve” no site não estão ativos.
        </p>

        <h2>8. Propriedade intelectual</h2>
        <p>
          A marca mila., o site, o software e a identidade visual pertencem aos
          respectivos titulares. Você mantém direitos sobre o conteúdo da sua
          loja. Concedemos licença limitada para usar o serviço conforme estes
          termos; você nos concede licença para processar suas entradas só na
          medida necessária para prestar o serviço (veja a política de
          privacidade).
        </p>

        <h2>9. Isenções e limite de responsabilidade</h2>
        <p>
          O piloto é oferecido “como está”, com esforço razoável de
          disponibilidade e segurança, sem garantia de resultado comercial
          específico (lucro, conversão, aprovação de anúncio etc.).
        </p>
        <p>
          Na máxima extensão permitida pela lei brasileira: (a) no piloto sem
          cobrança, a responsabilidade da mila. limita-se às hipóteses
          inafastáveis por lei; (b) se houver pagamento, limita-se ao valor
          efetivamente pago por você nos 3 meses anteriores ao evento — salvo
          dolo ou outra hipótese legal inafastável.
        </p>
        <p>
          A mila. não é consultoria jurídica, contábil ou fiscal. Decisões de
          preço, tributação e compliance fiscal são suas.
        </p>

        <h2>10. Suspensão e encerramento</h2>
        <p>
          Podemos suspender ou encerrar o acesso em caso de violação, risco de
          segurança, ordem legal ou fim do piloto. Você pode parar de usar a
          qualquer momento e pedir exclusão de dados pelo canal indicado na
          política de privacidade.
        </p>

        <h2>11. Mudanças</h2>
        <p>
          Podemos atualizar estes termos. A versão vigente fica nesta página,
          com a data no topo. O uso continuado após mudança material, quando
          comunicada de forma razoável, implica aceite — salvo regra legal em
          contrário.
        </p>

        <h2>12. Lei e foro</h2>
        <p>
          Aplica-se a legislação brasileira. Fica eleito o foro da comarca de
          Belo Horizonte/MG, salvo foro privilegiado legal do consumidor quando
          aplicável.
        </p>

        <h2>13. Contato</h2>
        <p>
          Privacidade e dados:{" "}
          <a href="mailto:privacy@milaai.com.br">privacy@milaai.com.br</a>.
          Suporte do piloto: Instagram @usemila.ai.
        </p>
        <p>
          <em>
            Estes textos foram redigidos para o piloto com base nas práticas
            atuais do produto. Não substituem revisão por advogado antes de
            cobrança ampla ou constituição formal da empresa.
          </em>
        </p>
      </div>
    </div>
  );
}
