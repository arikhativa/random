<!DOCTYPE html>
<html>
<body>

<h1>My first PHP page</h1>

<?php
$colors = getenv();

foreach ($colors as $value) {
  echo "$value <br>";
}
?>

</body>
</html>