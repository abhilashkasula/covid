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

const drawInfo = function(data) {
  drawTotalStats(data);
};

const main = function () {
  fetch('https://api.covid19india.org/v2/state_district_wise.json')
    .then((res) => res.json())
    .then(drawInfo);
};

window.onload = main;
