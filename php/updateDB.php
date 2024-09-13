<?php

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $xmlContent = $_POST['xml'];

    // Specify the path to your XML file
    $filePath = $_POST['db'];

    // Write the content to the file
    if (file_put_contents($filePath, $xmlContent)) {
        echo "XML file successfully overwritten !!!";
    } else {
        echo "Error writing XML file.";
    }
}

?>