
/* =====================================================
   CONFIGURAÇÃO — edite só este bloco para cada clínica
   ===================================================== */
const CLINIC = {
    name: "Clínica Vida Plena",
    headline: "Cuidado que começa no acolhimento",
    subheadline: "Atendimento humano, com tempo para ouvir você e a sua família.",
    about: "Somos uma clínica focada em oferecer atendimento de qualidade em um ambiente tranquilo. Cada paciente recebe atenção individual, do primeiro contato ao acompanhamento.",
    whatsapp: "5511999999999",          // país + DDD + número, só dígitos
    instagram: "https://instagram.com/suaclinica",
    address: "Rua Exemplo, 123 - Centro, São Paulo - SP",
    logo: "",                            // ex.: "logo.png" (vazio = usa o ícone)
    heroPhoto: "",                       // ex.: "fotos/fachada.jpg"
    services: ["Clínica geral", "Pediatria", "Exames", "Retorno"],
    team: [
        { name: "Dra. Nome Sobrenome", role: "Médica responsável · CRM 00000", photo: "" },
        { name: "Dr. Nome Sobrenome", role: "Especialista · CRM 00000", photo: "" }
    ],
    gallery: [  // troque "src" pelo caminho das fotos reais
        { label: "Recepção", src: "" },
        { label: "Sala de espera", src: "" },
        { label: "Consultório", src: "" },
        { label: "Sala de atendimento", src: "" },
        { label: "Fachada", src: "" }
    ],
    // dia da semana: 0 = domingo ... 6 = sábado. null = fechado
    hours: [
        ["Domingo", null], ["Segunda", "08h às 18h"], ["Terça", "08h às 18h"],
        ["Quarta", "08h às 18h"], ["Quinta", "08h às 18h"], ["Sexta", "08h às 17h"], ["Sábado", "08h às 12h"]
    ]
};

/* ================== Montagem da página ================== */
const $ = s => document.querySelector(s);
const bg = (el, src) => { if (src) { el.style.setProperty('--ph', `url("${src}")`); el.textContent = ''; } };

document.title = CLINIC.name;
document.querySelectorAll('[data-bind]').forEach(el => {
    const k = el.dataset.bind;
    if (k === 'logoMark') {
        if (CLINIC.logo) el.innerHTML = `<img src="${CLINIC.logo}" alt="Logo ${CLINIC.name}">`;
    } else el.textContent = CLINIC[k];
});
$('#year').textContent = new Date().getFullYear();
bg($('#heroPhoto'), CLINIC.heroPhoto);

$('#services').innerHTML = CLINIC.services.map(s => `<li>${s}</li>`).join('');
$('#service').insertAdjacentHTML('beforeend', CLINIC.services.map(s => `<option>${s}</option>`).join(''));

$('#team').innerHTML = CLINIC.team.map(p =>
    `<div class="person"><div class="avatar"${p.photo ? ` style="--ph:url('${p.photo}')"` : ''}></div><div><h3>${p.name}</h3><p>${p.role}</p></div></div>`).join('');

$('#gallery').innerHTML = CLINIC.gallery.map(g =>
    `<div class="shot"${g.src ? ` style="--ph:url('${g.src}')"` : ''}><span>${g.label}</span></div>`).join('');

const today = new Date().getDay();
$('#hours').innerHTML = CLINIC.hours.map(([d, h], i) =>
    `<tr class="${i === today ? 'today' : ''}"><td>${d}</td><td>${h || 'Fechado'}</td></tr>`).join('');

const q = encodeURIComponent(CLINIC.address);
$('#map').src = `https://maps.google.com/maps?q=${q}&output=embed`;
$('#routeBtn').href = `https://www.google.com/maps/search/?api=1&query=${q}`;
$('#fbWa').href = `https://wa.me/${CLINIC.whatsapp}?text=${encodeURIComponent('Olá! Gostaria de mais informações.')}`;
$('#fbIg').href = CLINIC.instagram;

/* ================== Formulário ================== */
const minor = $('#isMinor'), minorBox = $('#minorBox');
const dateEl = $('#date');
dateEl.min = new Date().toISOString().split('T')[0];

minor.addEventListener('change', () => {
    minorBox.classList.toggle('on', minor.checked);
    $('#nameLabel').textContent = minor.checked ? 'Seu nome (contato)' : 'Seu nome';
    $('#nameField').style.display = minor.checked ? 'none' : '';
});

$('#phone').addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 6) v = v.replace(/^(\d{2})(\d{4,5})(\d{0,4}).*/, '($1) $2-$3');
    else if (v.length > 2) v = v.replace(/^(\d{2})(\d*)/, '($1) $2');
    e.target.value = v;
});

function check(id, ok) {
    const f = $('#' + id).closest('.field');
    f.classList.toggle('bad', !ok);
    return ok;
}

$('#form').addEventListener('submit', e => {
    e.preventDefault();
    const v = id => $('#' + id).value.trim();
    const isMinor = minor.checked;
    const results = [
        isMinor ? check('patient', !!v('patient')) : check('name', !!v('name')),
        isMinor ? check('guardian', !!v('guardian')) : true,
        check('phone', v('phone').replace(/\D/g, '').length >= 10),
        check('address', !!v('address')),
        check('date', !!v('date')),
        check('time', !!v('time'))
    ];
    if (results.includes(false)) { document.querySelector('.bad input')?.focus(); return; }

    const [y, m, d] = v('date').split('-');
    const lines = ['*Pedido de agendamento*', ''];
    if (isMinor) {
        lines.push(`*Paciente (menor):* ${v('patient')}`, `*Responsável:* ${v('guardian')}`);
    } else {
        lines.push(`*Nome:* ${v('name')}`);
    }
    lines.push(`*WhatsApp:* ${v('phone')}`, `*Endereço:* ${v('address')}`);
    if (v('service')) lines.push(`*Serviço:* ${v('service')}`);
    lines.push(`*Sugestão de dia e horário:* ${d}/${m}/${y} às ${v('time')}`);
    if (v('msg')) lines.push('', `*Mensagem:* ${v('msg')}`);
    lines.push('', '_Aguardo a confirmação da disponibilidade._');

    window.open(`https://wa.me/${CLINIC.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
});
