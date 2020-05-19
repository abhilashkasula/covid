const getTotalCount = function (data) {
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
  } = getTotalCount( data);
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

const getDelta = (n) => n ? `↑${n}` : '';

const generateStates = function(state) {
  const {c, cd, a, ad, d, dd, r, rd} = getStateCount(state.districtData);
  return `
  <div class="state">
    <h2 class="state-name">${state.state}</h2>
    <table>
      <tr>
        <td class="value confirmed-text"><span class="delta">${getDelta(cd)}</span> ${c}</td>
      </tr>
      <tr>
      <td class="value active-text"><span class="delta">${getDelta(ad)}</span> ${a}</td>
      </tr>
      <tr>
      <td class="value deceased-text"><span class="delta">${getDelta(dd)}</span> ${d}</td>
      </tr>
      <tr>
      <td class="value recovered-text"><span class="delta">${getDelta(rd)}</span> ${r}</td>
      </tr>
    </table>
  </div>
  <div class="state-info hide" id="state-${state.state.replace(/ /g, '-')}"></div>
`
};

const generateDistrict = function(district, zones) {
  const dist = zones.find(z => z.district ===district.district);
  const zone = (dist ? dist.zone : 'Unknown') || 'Unknown';
  return `
    <tr>
    <td class="district ${zone}-zone">${district.district}</td>
    <td class="col"><span class="confirmed-text">${getDelta(district.delta.confirmed)}</span> ${district.confirmed}</td>
    <td class="col">${district.active}</td>
    <td class="col"><span class="deceased-text">${getDelta(district.delta.deceased)}</span> ${district.deceased}</td>
    <td class="col"><span class="recovered-text">${getDelta(district.delta.recovered)}</span> ${district.recovered}</td>
    </tr>
    `
};

const descend = (a, b) => {
  return a.confirmed > b.confirmed ? -1 : a.confirmed < b.confirmed ? 1 : 0;
};

const drawDistricts = function(data, zones, state) {
  const states = Array.from(document.querySelectorAll('.state-info'));
  states.forEach(state => state.classList.add('hide'));
  const elem = document.querySelector(`#state-${state.replace(/ /g, '-')}`);
  const districts = data.find(s => s.state === state).districtData;
  let html = `
  <table>
    <thead>
      <th class="deceased-text">State</th>
      <th class="confirmed-text">Cnfrmd</th>
      <th class="active-text">Active</th>
      <th class="deceased-text">Dcsd</th>
      <th class="recovered-text">Rcvrd</th>
    </thead>
    <tbody>`
  html += districts.sort(descend).map(district => generateDistrict(district, zones)).join('');
  html += '</tbody></table>';
  elem.classList.remove('hide');
  elem.innerHTML = html;
};

const sortOnConfirmedCases = (a, b) => {
  const {c: confirmedA} = getStateCount(a.districtData);
  const {c: confirmedB} = getStateCount(b.districtData);
  return confirmedA > confirmedB ? -1 : confirmedA < confirmedB ? 1 : 0;
};

const drawStates = function(data) {
  const html = data.sort(sortOnConfirmedCases).map(generateStates).join('');
  document.querySelector('#states').innerHTML = html;
};

const addListeners = function(data, zones) {
  Array.from(document.querySelectorAll('.state')).forEach(s => {
    s.addEventListener('click', (event) => {
      const name = event.target.children[0].innerText;
      drawDistricts(data, zones, name);
    });
  });

  document.querySelector('#search').addEventListener('input', () => {
    const states = Array.from(document.querySelectorAll('.state'));
    const stateInfos = Array.from(document.querySelectorAll('.state-info'));
    stateInfos.forEach(s => s.innerHTML = '');
    const text = event.target.value;
    states.forEach(s => s.classList.add('hide'));
    const regEx = new RegExp(text, 'i');
    const matched = states.filter(s => s.children[0].innerText.match(regEx))
    matched.forEach(s => s.classList.remove('hide'))
  });
};

const drawInfo = function(data, zones) {
  drawTotalStats(data);
  drawStates(data);
  addListeners(data, zones);
};

const fetchZones = function(data) {
  fetch('https://api.covid19india.org/zones.json')
    .then(res => res.json())
    .then(zones => drawInfo(data, zones.zones));
}

const main = function () {
  fetch('https://api.covid19india.org/v2/state_district_wise.json')
    .then((res) => res.json())
    .then(fetchZones);
  setTimeout(main, 1200000);
};

window.onload = main;
