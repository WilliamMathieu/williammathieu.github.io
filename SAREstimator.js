var sarTissues={
  muscle:{s:0.77,r:1050}, brain:{s:0.59,r:1040},
  fat:{s:0.044,r:920}, blood:{s:1.24,r:1060}
};
function sarTissueChange(){
  var t=document.getElementById('sar-tissue').value;
  var d=sarTissues[t];
  var cust=!d;
  document.getElementById('sar-sigma').disabled=!cust;
  document.getElementById('sar-rho').disabled=!cust;
  if(d){document.getElementById('sar-sigma').value=d.s; document.getElementById('sar-rho').value=d.r;}
}
document.getElementById('sar-btn').addEventListener('click', function(){
  var B1=parseFloat(document.getElementById('sar-b1').value)*1e-6;
  var f=parseFloat(document.getElementById('sar-f').value)*1e6;
  var sig=parseFloat(document.getElementById('sar-sigma').value);
  var rho=parseFloat(document.getElementById('sar-rho').value);
  var dc=parseFloat(document.getElementById('sar-dc').value);
  document.getElementById('error').textContent='';
  if([B1,f,sig,rho,dc].some(isNaN)||B1<=0||f<=0||sig<=0||rho<=0||dc<=0||dc>1){
    document.getElementById('error').textContent='Enter valid positive values. Duty cycle 0–1.';return;}
  var w=2*Math.PI*f;
  // Faraday-induced E-field in a cylinder of radius r under a rotating B₁ (MRI birdcage model):
  //   E_peak = ω·B₁·r/2   [V/m]  — Pozar / IEC 60601-2-33 §29.201
  // SAR_peak = σ·E²/(2ρ) = σ·ω²·B₁²·r²/(8ρ)
  // B₁+ safety limit from SAR_avg ≤ 2 W/kg (whole-body, IEC 60601-2-33):
  //   B₁_lim = √(2·ρ·2/(σ·(ω·r/2)²)) = 2/r · √(ρ/(σ·ω²))
  var r_eff=0.10; // 10 cm typical for head/body
  var E_est=w*B1*r_eff/2; // V/m (Faraday induction, rotating B1)
  var SAR_peak=sig*E_est*E_est/(2*rho);
  var SAR_avg=SAR_peak*dc;
  // B1+ limit for 2 W/kg (whole body)
  var B1_lim=(2/r_eff)*Math.sqrt(rho*2.0/(sig*w*w));
  var margin_dB=20*Math.log10(B1_lim/(B1/1e-6)*1e6);
  var wb_status=SAR_avg<=2?'✓ Within limit ('+SAR_avg.toFixed(2)+' / 2.0 W/kg)':'⚠ EXCEEDS LIMIT';
  var head_status=SAR_avg<=3.2?'✓ Within limit':'⚠ EXCEEDS LIMIT';
  document.getElementById('sar-peak').textContent=SAR_peak.toFixed(2)+' W/kg';
  document.getElementById('sar-avg').textContent=SAR_avg.toFixed(2)+' W/kg (DC='+dc+')';
  document.getElementById('sar-wb').textContent=wb_status;
  document.getElementById('sar-head').textContent=head_status;
  document.getElementById('sar-e').textContent=E_est.toFixed(1)+' V/m';
  document.getElementById('sar-wb1').textContent=(w*B1/2).toFixed(1)+' V/m/m';
  document.getElementById('sar-b1lim').textContent=(B1_lim*1e6).toFixed(1)+' µT';
  document.getElementById('sar-margin').textContent=margin_dB.toFixed(1)+' dB';
});
document.addEventListener('DOMContentLoaded', sarTissueChange);
