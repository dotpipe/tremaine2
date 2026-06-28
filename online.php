<?php
header('Content-Type: application/json');
header('Cache-Control: no-store');

$id = preg_replace('/[^a-zA-Z0-9._-]/', '', $_GET['id'] ?? '');
if ($id === '') {
  echo json_encode(['playersOnline' => 1]);
  exit;
}

$file = __DIR__ . '/online_players.json';
$now = time();
$players = [];

if (file_exists($file)) {
  $raw = file_get_contents($file);
  $decoded = json_decode($raw, true);
  if (is_array($decoded)) {
    $players = $decoded;
  }
}

$players[$id] = $now;
$players = array_filter($players, function ($lastSeen) use ($now) {
  return is_numeric($lastSeen) && ($now - intval($lastSeen)) <= 90;
});

file_put_contents($file, json_encode($players), LOCK_EX);
echo json_encode(['playersOnline' => max(1, count($players))]);
