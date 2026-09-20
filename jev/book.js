'use strict';
const worthwhileRanks = [2, 5, 8, 12, 17, 21, 25, 34, 48, 63, 79, 94];
function screeningMetrics(reviewed) {
  const found = worthwhileRanks.filter(rank => rank <= reviewed).length;
  return {found, missed: worthwhileRanks.length - found, recall: found / worthwhileRanks.length,
    precision: found / reviewed, saved: (100 - reviewed) / 100};
}
function inferenceCost(companies, tokens) { return companies * tokens * 0.042 / 1000000; }
function expectedLevel(probabilities) { return probabilities.reduce((sum, p, i) => sum + p * i, 0); }
if (typeof module !== 'undefined') module.exports = {screeningMetrics, inferenceCost, expectedLevel};

if (typeof document !== 'undefined') {
  const $ = id => document.getElementById(id);
  const distributions = {
    middle: {values:[0,0,1,0,0], text:'All probability is on level 2. This is a definite middle assessment under the invented rubric.'},
    split: {values:[.5,0,0,0,.5], text:'The average is still 2, but no probability is on level 2. Half is at each extreme. The average hides unresolved disagreement; inspect the evidence.'},
    strong: {values:[0,0,.05,.25,.7], text:'Most probability is on the highest level. The average is 3.65. Whether this assessment is correct still depends on the evidence and validation.'}
  };
  document.querySelectorAll('[data-dist]').forEach(button => button.addEventListener('click', () => {
    const {values,text} = distributions[button.dataset.dist];
    document.querySelectorAll('[data-dist]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    $('distribution').replaceChildren(...values.map((value,i) => {
      const col = document.createElement('div'); col.className = 'dist-col';
      const label = document.createElement('span'); label.textContent = Math.round(value*100)+'%';
      const bar = document.createElement('i'); bar.className = 'fill'; bar.style.height = (value*72)+'%';
      const level = document.createElement('span'); level.className = 'level'; level.textContent = 'Level '+i;
      col.append(label,bar,level); return col;
    }));
    $('dist-mean').textContent = expectedLevel(values).toFixed(2);
    $('dist-top').textContent = Math.round(Math.max(...values)*100)+'%';
    $('dist-tail').textContent = Math.round(values[4]*100)+'%';
    $('dist-explanation').textContent = text;
  }));
  const dots = Array.from({length:100}, (_,i) => {
    const dot = document.createElement('span'); dot.className = 'dot';
    dot.title = 'Rank '+(i+1)+(worthwhileRanks.includes(i+1)?' · worthwhile in this example':'');
    dot.setAttribute('aria-hidden','true'); $('screen-dots').append(dot); return dot;
  });
  function updateScreening() {
    const count = Number($('review-count').value); const m = screeningMetrics(count);
    $('review-value').textContent = count;
    dots.forEach((dot,i) => {const good = worthwhileRanks.includes(i+1);
      dot.className = 'dot'+(i<count?' kept':'')+(good?' good':'')+(good&&i>=count?' missed':'');
    });
    $('screen-recall').textContent = Math.round(m.recall*100)+'%';
    $('screen-recall').nextElementSibling.textContent = `recall · ${m.found} of 12 found`;
    $('screen-precision').textContent = Math.round(m.precision*100)+'%';
    $('screen-precision').nextElementSibling.textContent = `precision · ${m.found} of ${count} reviewed`;
    $('screen-saved').textContent = Math.round(m.saved*100)+'%';
    $('screen-explanation').textContent = count===100
      ? 'Reading every company finds all 12 worthwhile cases. There is no reduction in reading; this is the full-coverage reference point.'
      : `Reviewing the top ${count} saves ${Math.round(m.saved*100)}% of the reading, but misses ${m.missed} of the 12 worthwhile companies.`;
  }
  $('review-count').addEventListener('input', updateScreening); updateScreening();
  function updateCost() {
    const companies = Number($('company-count').value), tokens = Number($('packet-tokens').value);
    const cost = inferenceCost(companies,tokens);
    $('company-value').textContent = companies.toLocaleString('en-US');
    $('token-value').textContent = tokens.toLocaleString('en-US');
    $('cost-one').textContent = '$'+cost.toFixed(4); $('cost-ten').textContent = '$'+(10*cost).toFixed(4);
    $('cost-input').textContent = (companies*tokens/1000000).toFixed(2)+'M';
  }
  ['company-count','packet-tokens'].forEach(id => $(id).addEventListener('input',updateCost)); updateCost();
  $('print').addEventListener('click', () => window.print());
  let closedBeforePrint = [];
  window.addEventListener('beforeprint', () => {
    closedBeforePrint = Array.from(document.querySelectorAll('article details:not([open])'));
    closedBeforePrint.forEach(detail => {detail.open = true;});
  });
  window.addEventListener('afterprint', () => {closedBeforePrint.forEach(detail => {detail.open = false;});});
  let scheduled = false;
  function updateProgress() {
    scheduled = false;
    const full = document.documentElement.scrollHeight-window.innerHeight;
    $('progress').style.width = Math.min(100,Math.max(0,100*window.scrollY/full))+'%';
    let current = 'starting-point';
    document.querySelectorAll('section.chapter').forEach(section => {if(section.getBoundingClientRect().top<180)current=section.id;});
    document.querySelectorAll('.sidebar nav a').forEach(a => {
      const active = a.hash==='#'+current; a.classList.toggle('active',active);
      if(active)a.setAttribute('aria-current','location'); else a.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', () => {if(!scheduled){scheduled=true;requestAnimationFrame(updateProgress);}}, {passive:true});
  window.addEventListener('resize',updateProgress); updateProgress();
  const words = Array.from(document.querySelectorAll('section.chapter:not(.sources)')).map(x=>x.textContent).join(' ').trim().split(/\s+/).length;
  $('reading-time').textContent = 'About '+Math.ceil(words/200)+' minutes';
}
