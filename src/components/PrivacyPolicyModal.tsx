import { useEffect, useRef } from 'react'

import { Check, X } from 'lucide-react'

interface PrivacyPolicyModalProps {
  open: boolean
  onClose: () => void
  onReadComplete: () => void
  readComplete: boolean
}

const POLICY_VERSION = 'v1.2'

const policyPurposes = [
  'Criar e manter o cadastro do usuário',
  'Permitir a conferência administrativa do registro profissional e da identidade para acesso de enfermagem',
  'Permitir a autenticação e o acesso seguro à plataforma',
  'Realizar autenticação em dois fatores',
  'Permitir recuperação de senha',
  'Permitir o agendamento de doações',
  'Realizar a pré-triagem',
  'Disponibilizar informações necessárias aos profissionais responsáveis pelo atendimento',
  'Registrar e consultar o histórico relacionado às doações e atendimentos',
  'Facilitar a comunicação entre doador e hemocentro',
  'Garantir a segurança da plataforma',
  'Identificar e prevenir tentativas de acesso indevido',
  'Melhorar a experiência e o funcionamento da aplicação',
]

const identificationData = ['Nome completo', 'CPF', 'Data de nascimento', 'Tipo sanguíneo', 'E-mail', 'Telefone', 'Número e UF do COREN, exclusivamente no cadastro de enfermeiros']
const donationData = [
  'Histórico de doações',
  'Agendamentos',
  'Informações relacionadas à pré-triagem',
  'Respostas ao questionário de saúde',
  'Informações sobre utilização de medicamentos, quando informadas',
  'Informações sobre vacinação, quando informadas',
  'Informações necessárias para avaliação e atendimento no hemocentro',
]
const securityData = [
  'Informações relacionadas à autenticação',
  'Registros necessários para controle de sessão',
  'Tentativas de acesso',
  'Informações necessárias para recuperação de senha',
  'Registros técnicos necessários para segurança da aplicação',
]
const accessProfiles = ['Doador', 'Enfermeiro', 'Médico', 'Recepcionista', 'Responsável pelo Hemocentro', 'Administrador']
const communicationPurposes = [
  'Código de autenticação em dois fatores',
  'Recuperação de senha',
  'Informações relacionadas à utilização da plataforma',
  'Comunicações relacionadas aos processos realizados no sistema',
]
const userRights = [
  'Confirmar a existência de tratamento de seus dados',
  'Solicitar acesso às informações',
  'Solicitar correção de dados incorretos ou incompletos',
  'Solicitar informações sobre a utilização dos dados',
  'Solicitar revisão de informações quando aplicável',
  'Solicitar eliminação de dados quando permitido',
  'Obter informações sobre compartilhamento e tratamento',
  'Solicitar outras medidas previstas pela legislação aplicável',
]
const userResponsibilities = [
  'Não compartilhar sua senha',
  'Não compartilhar códigos de autenticação',
  'Não fornecer links de recuperação de senha a terceiros',
  'Utilizar uma senha segura',
  'Encerrar a sessão ao utilizar computadores compartilhados',
  'Comunicar qualquer atividade suspeita relacionada à sua conta',
]

function PolicyList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5">
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  )
}

export function PrivacyPolicyModal({ open, onClose, onReadComplete, readComplete }: PrivacyPolicyModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    closeButtonRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, open])

  useEffect(() => {
    if (!open || readComplete) return
    const scrollArea = scrollAreaRef.current
    if (scrollArea && scrollArea.scrollHeight <= scrollArea.clientHeight) onReadComplete()
  }, [onReadComplete, open, readComplete])

  function handleScroll() {
    const scrollArea = scrollAreaRef.current
    if (!scrollArea || readComplete) return
    const reachedEnd = scrollArea.scrollTop + scrollArea.clientHeight >= scrollArea.scrollHeight - 8
    if (reachedEnd) onReadComplete()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section
        className="flex max-h-[min(92vh,52rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-red-100 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-policy-title"
        aria-describedby="privacy-policy-reading-status"
      >
        <header className="flex items-start justify-between gap-4 border-b border-red-100 px-5 py-4 md:px-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-700">Hemo Connect · {POLICY_VERSION}</p>
            <h2 id="privacy-policy-title" className="mt-2 text-2xl font-semibold text-zinc-900">Política de Privacidade e Uso de Dados</h2>
          </div>
          <button ref={closeButtonRef} type="button" onClick={onClose} className="rounded-lg p-2 text-zinc-500 hover:bg-red-50 hover:text-red-800" aria-label="Fechar política de privacidade">
            <X size={20} />
          </button>
        </header>

        <div ref={scrollAreaRef} onScroll={handleScroll} className="min-h-0 flex-1 overflow-y-auto px-5 py-5 text-sm leading-6 text-zinc-700 md:px-7">
          <article className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-zinc-900">1. Sobre esta política</h3>
              <p>O Hemo Connect valoriza a privacidade e a segurança das informações de seus usuários. Esta Política de Privacidade tem como objetivo explicar, de forma clara e transparente, quais dados são coletados durante a utilização da aplicação, para quais finalidades eles são utilizados e como são protegidos.</p>
              <p className="mt-3">Ao utilizar o Hemo Connect, o usuário declara estar ciente das práticas descritas nesta política.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-zinc-900">2. Quais dados coletamos?</h3>
              <p>Durante a utilização do Hemo Connect, podemos coletar informações necessárias para o funcionamento da plataforma, incluindo:</p>
              <h4 className="mt-3 font-semibold text-zinc-900">Dados de identificação</h4>
              <PolicyList items={identificationData} />
              <p className="mt-3">O COREN informado será disponibilizado ao administrador para conferência profissional e liberação do acesso vinculado a um hemocentro. Não realizamos consulta automática ao conselho. A conta de enfermagem permanece inativa enquanto a solicitação estiver pendente.</p>
              <h4 className="mt-3 font-semibold text-zinc-900">Dados relacionados à doação</h4>
              <PolicyList items={donationData} />
              <h4 className="mt-3 font-semibold text-zinc-900">Dados de segurança e acesso</h4>
              <PolicyList items={securityData} />
            </section>

            <section>
              <h3 className="text-lg font-semibold text-zinc-900">3. Para que utilizamos esses dados?</h3>
              <p>Os dados coletados são utilizados exclusivamente para finalidades relacionadas ao funcionamento do Hemo Connect, incluindo:</p>
              <PolicyList items={policyPurposes} />
              <p className="mt-3">Os dados não devem ser utilizados para finalidades incompatíveis com aquelas informadas ao usuário.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-zinc-900">4. Dados relacionados à saúde</h3>
              <p>O Hemo Connect pode tratar informações relacionadas à saúde fornecidas pelo usuário durante o processo de pré-triagem e atendimento.</p>
              <p>Essas informações possuem caráter sensível e devem ser utilizadas exclusivamente quando necessárias para as finalidades relacionadas ao processo de doação e avaliação profissional.</p>
              <p>O acesso a essas informações deve ser limitado aos profissionais e usuários que possuam autorização compatível com sua função dentro do sistema.</p>
              <p>Por exemplo:</p>
              <PolicyList items={['O doador pode consultar suas próprias informações', 'O enfermeiro pode consultar informações necessárias para realizar a triagem', 'O médico pode consultar informações necessárias para realizar sua avaliação', 'Usuários sem autorização não devem ter acesso a essas informações']} />
            </section>

            <section>
              <h3 className="text-lg font-semibold text-zinc-900">5. Como protegemos seus dados?</h3>
              <p>O Hemo Connect utiliza mecanismos de segurança para reduzir o risco de acesso não autorizado às informações.</p>
              <p>Entre os mecanismos utilizados estão:</p>
              <PolicyList items={['Senhas protegidas por Argon2id', 'Autenticação em dois fatores (2FA)', 'Códigos de autenticação temporários', 'Tokens temporários para recuperação de senha', 'Expiração de sessões por inatividade', 'Controle de tentativas de login', 'Bloqueio temporário após tentativas inválidas', 'Controle de acesso baseado no perfil do usuário', 'Proteção das credenciais utilizadas pelos serviços da aplicação', 'Armazenamento estruturado dos dados em banco PostgreSQL']} />
              <p>As credenciais e informações utilizadas para comunicação com serviços externos, como o envio de e-mails, não devem ser expostas ao usuário ou armazenadas diretamente no código da aplicação.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-zinc-900">6. Quem pode acessar seus dados?</h3>
              <p>O acesso às informações é realizado de acordo com a função exercida no Hemo Connect.</p>
              <p>O sistema utiliza diferentes perfis de acesso, como:</p>
              <PolicyList items={accessProfiles} />
              <p>Cada perfil possui permissões específicas. O objetivo é garantir que cada usuário tenha acesso somente às informações necessárias para desempenhar suas atividades dentro da plataforma.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-zinc-900">7. Compartilhamento de informações</h3>
              <p>Os dados do usuário não devem ser compartilhados de forma indiscriminada.</p>
              <p>Quando necessário para o funcionamento da aplicação, determinadas informações podem ser processadas por serviços utilizados pelo Hemo Connect, como serviços de hospedagem, banco de dados e envio de e-mails.</p>
              <p>Esses serviços são utilizados para possibilitar o funcionamento técnico da plataforma e não significam autorização para utilização dos dados para finalidades diferentes das apresentadas nesta política.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-zinc-900">8. E-mails e comunicações</h3>
              <p>O Hemo Connect pode utilizar o endereço de e-mail informado pelo usuário para comunicações relacionadas à segurança e ao funcionamento da conta, incluindo:</p>
              <PolicyList items={communicationPurposes} />
              <p>O serviço utilizado para envio de e-mails não deve receber a senha do usuário ou outros dados que não sejam necessários para o envio da comunicação.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-zinc-900">9. Retenção dos dados</h3>
              <p>Os dados devem ser mantidos pelo período necessário para cumprir as finalidades para as quais foram coletados e para atender às necessidades operacionais, de segurança e às obrigações aplicáveis.</p>
              <p>Quando não houver mais necessidade de manutenção de determinada informação, ela poderá ser excluída, anonimizada ou submetida a outra forma adequada de tratamento, observadas as regras aplicáveis.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-zinc-900">10. Direitos do usuário</h3>
              <p>O usuário possui direitos relacionados aos seus dados pessoais, incluindo, conforme aplicável:</p>
              <PolicyList items={userRights} />
              <p>As solicitações podem estar sujeitas a validações de identidade e às limitações previstas na legislação.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-zinc-900">11. Responsabilidade do usuário</h3>
              <p>O usuário também possui responsabilidade pela proteção de sua conta.</p>
              <p>Recomendamos:</p>
              <PolicyList items={userResponsibilities} />
              <p>O Hemo Connect nunca deve solicitar que o usuário informe sua senha por e-mail.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-zinc-900">12. Alterações nesta política</h3>
              <p>Esta Política de Privacidade poderá ser atualizada para refletir mudanças na aplicação, nos procedimentos de segurança ou nas formas de tratamento de dados.</p>
              <p>Quando houver alterações relevantes, o usuário poderá ser informado por meio da própria plataforma ou pelos canais de comunicação disponíveis.</p>
            </section>

            <section className="border-t border-red-100 pt-5">
              <h3 className="text-lg font-semibold text-zinc-900">Consentimento e ciência</h3>
              <blockquote className="mt-3 border-l-4 border-red-300 pl-4 italic">Li e estou ciente da Política de Privacidade e do tratamento dos meus dados pessoais para as finalidades apresentadas acima.</blockquote>
              <p className="mt-3 font-semibold">□ Li e estou ciente da Política de Privacidade</p>
              <p className="mt-3 text-xs leading-5 text-zinc-600"><strong>Nota (projeto acadêmico):</strong> para fins deste projeto acadêmico, essa caixa de seleção deve ser tratada como ciência/aceite dos termos apresentados, sem afirmar que todo tratamento de dados do Hemo Connect depende necessariamente de consentimento. Na LGPD, a base legal adequada pode variar conforme a finalidade do tratamento, especialmente quando existem dados pessoais sensíveis relacionados à saúde.</p>
            </section>
          </article>
        </div>

        <footer className="flex flex-col gap-3 border-t border-red-100 bg-red-50/50 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-7">
          <p id="privacy-policy-reading-status" className="text-sm text-zinc-700" aria-live="polite">
            {readComplete ? <span className="inline-flex items-center gap-2 font-semibold text-emerald-700"><Check size={16} /> Leitura concluída.</span> : 'Role até o final da política para liberar o aceite.'}
          </p>
          <button type="button" onClick={onClose} disabled={!readComplete} className="rounded-xl bg-red-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50">
            {readComplete ? 'Concluir leitura' : 'Leia até o final'}
          </button>
        </footer>
      </section>
    </div>
  )
}

export { POLICY_VERSION }
