import { PUBLIC_ANCHORS, findByAccession } from '/src/atlas-graph.mjs';

const $ = id => document.getElementById(id);
let stream = null;
let match = null;

function stopCamera() {
  for (const track of stream?.getTracks() || []) track.stop();
  stream = null;
  const video = $('preview');
  video.srcObject = null;
  video.hidden = true;
  $('open-camera').hidden = false;
  $('close-camera').hidden = true;
  $('camera-status').textContent = 'Camera is off. Tracks were stopped. No frames were stored.';
}

async function openCamera() {
  $('camera-status').textContent = 'Asking for the camera…';
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
    const video = $('preview');
    video.srcObject = stream;
    video.hidden = false;
    $('open-camera').hidden = true;
    $('close-camera').hidden = false;
    $('camera-status').textContent = 'Camera is on for this page only. Image recognition is not configured.';
  } catch {
    $('camera-status').textContent = 'Camera permission was declined or is unavailable. You can still type an accession.';
  }
}

function resetConfirmation() {
  match = null;
  $('confirm').checked = false;
  $('confirm').disabled = true;
  $('handoff').hidden = true;
}

function checkAccession() {
  resetConfirmation();
  const found = findByAccession(PUBLIC_ANCHORS, $('accession').value);
  const result = $('result');
  if (found.status === 'EXACT') {
    match = found.record;
    result.textContent = 'Possible record: ' + found.record.title + ' · ' + found.record.accession + '. This is not a visual match. Confirm only if the object in front of you is this record.';
    $('confirm').disabled = false;
    return;
  }
  result.textContent = found.status === 'AMBIGUOUS'
    ? 'More than one public record shares that string. No identity was chosen.'
    : 'Not verified against the six public packets. A prefix is not an identity.';
}

function confirm() {
  if (!$('confirm').checked || !match) {
    $('handoff').hidden = true;
    return;
  }
  const link = $('handoff');
  link.href = '../archive-society/?accession=' + encodeURIComponent(match.accession);
  link.hidden = false;
  link.textContent = 'Return to the atlas with ' + match.accession;
}

$('open-camera').addEventListener('click', openCamera);
$('close-camera').addEventListener('click', stopCamera);
$('check').addEventListener('click', checkAccession);
$('accession').addEventListener('input', resetConfirmation);
$('confirm').addEventListener('change', confirm);
document.addEventListener('visibilitychange', () => { if (document.hidden) stopCamera(); });
window.addEventListener('pagehide', stopCamera);
