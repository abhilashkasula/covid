const getTotalCount = function (data, key) {
  return data.reduce(
    (total, state) => {
      state.districtData.forEach((dist) => {
        total.confirmed += dist.confirmed;
        total.confirmedDelta += dist.delta.confirmed;
        total.recoveredDelta += dist.delta.recovered;
        total.deceasedDelta += dist.delta.deceased;
        total.active += dist.active;
        total.recovered += dist.recovered;
        total.deceased += dist.deceased;
      });
      return total;
    },
    {
      confirmed: 0,
      confirmedDelta: 0,
      active: 0,
      recovered: 0,
      recoveredDelta: 0,
      deceased: 0,
      deceasedDelta: 0,
    }
  );
};

const generateLabels = function(label, delta, cases) {
  delta = delta ? `[+${delta}]` : '</br>';
  return `<div class="total ${label.toLowerCase()}">
  <h4 class="cases">${label}</h4>
  <h2 class="cases">${cases}</h2>
  <h5 class="cases delta">${delta}</h5>
</div>`
};

const drawTotalStats = function (data, state = 'Telangana') {
  const {
    confirmed,
    active,
    recovered,
    deceased,
    confirmedDelta,
    recoveredDelta,
    deceasedDelta
  } = getTotalCount( data, 'confirmed' );
  const total = document.querySelector('#india-total');
  total.innerHTML = generateLabels('Confirmed', confirmedDelta, confirmed);
  total.innerHTML += generateLabels('Active', 0, active);
  total.innerHTML += generateLabels('Deceased', deceasedDelta, deceased);
  total.innerHTML += generateLabels('Recovered', recoveredDelta, recovered);
};

const getStateCount = function(districts) {
  return districts.reduce((total, dist) => {
    total.c += dist.confirmed;
    total.cd += dist.delta.confirmed;
    total.a += dist.active;
    total.d += dist.deceased;
    total.dd += dist.delta.deceased;
    total.r += dist.recovered;
    total.rd += dist.delta.recovered;
    return total;
  }, {c:0, cd:0, a:0, ad:0, d:0, dd:0, r:0, rd:0})
};

const generateStates = function(state) {
  const getDelta = (n) => n ? `[+${n}]` : '';
  const {c, cd, a, ad, d, dd, r, rd} = getStateCount(state.districtData);
  return `
  <div class="state">
    <h2 class="state-name">${state.state}</h2>
    <table>
      <tr>
        <td class="confirmed-text value"><span class="delta">${getDelta(cd)} </span>${c}</td>
      </tr>
      <tr>
      <td class="active-text value"><span class="delta">${getDelta(ad)} </span>${a}</td>
      </tr>
      <tr>
      <td class="deceased-text value"><span class="delta">${getDelta(dd)} </span>${d}</td>
      </tr>
      <tr>
      <td class="recovered-text value"><span class="delta">${getDelta(rd)} </span>${r}</td>
      </tr>
    </table>
  </div>
`
}

const sortOnConfirmedCases = (a, b) => {
  const {c: confirmedA} = getStateCount(a.districtData);
  const {c: confirmedB} = getStateCount(b.districtData);
  return confirmedA > confirmedB ? -1 : confirmedA < confirmedB ? 1 : 0;
};

const drawStates = function(data) {
  const html = data.sort(sortOnConfirmedCases).map(generateStates).join('');
  document.querySelector('#states').innerHTML = html;
};

const addListeners = function(data) {
  Array.from(document.querySelectorAll('.state')).forEach(s => {
    s.addEventListener('click', () => {
      const name = event.target.innerText;
      showDistricts(data, name);
    });
  });

  document.querySelector('#search').addEventListener('input', () => {
    const states = Array.from(document.querySelectorAll('.state'));
    const text = event.target.value;
    states.forEach(s => s.classList.add('hide'));
    const regEx = new RegExp(text, 'i');
    const matched = states.filter(s => s.children[0].innerText.match(regEx))
    matched.forEach(s => s.classList.remove('hide'))
  });
};

const drawInfo = function(data) {
  drawTotalStats(data);
  drawStates(data);
  addListeners(data);
};

const main = function () {
  fetch('https://api.covid19india.org/v2/state_district_wise.json')
    .then((res) => res.json())
    .then(drawInfo);
};

window.onload = main;
