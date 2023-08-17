<?php
// ------------------------------------------------------------------------------------------------------------------------
//
//  Description:    Transcript Analysis via OpenAI ChatGPT API
//  Author:         Gilberto Cortez
//  Company:        Interactive Utopia
//  Website:        InteractiveUtopia.com
//
// ------------------------------------------------------------------------------------------------------------------------

// Start Server Session
session_start();

// Require Global Variables
require '../_private/global.inc.php';
$endpoint = 'https://api.openai.com/v1/chat/completions';

$transcript = ($temp = file_get_contents('php://input')) !== '' ? $temp : null;

if ($transcript) {
    $data = array(
        'model' => 'gpt-3.5-turbo',
        'messages' => array(
            array('role' => 'system', 'content' => 'Analyze the provided transcripts and extract the following details: action, type, first name, last name, email (even if provided in a non-standard format), phone number, fax, address, city, state and zip code. Return the extracted information in JSON format only, without any additional text or explanation. If any detail is not present in the transcript, include an empty placeholder for it. When extracting the email, ensure it is complete, including both the username and domain (e.g., "save@interactiveutopia.com"), even if provided in a non-standard format. Allowed actions are: create, edit. Allowed types are: contact (message), appointment, report, noc (notice of completion), user. Interpret the transcript to determine the action and type, as the wording may vary. Use snake_case for multi-word keys, instead of using spaces'),
            array('role' => 'user', 'content' => $transcript)
        )
    );

    $ch = curl_init($endpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Content-Type: application/json',
        'Authorization: Bearer ' . OPENAI_API_KEY
    ));

    $response = curl_exec($ch);

    if ($response === false) {
        echo 'Curl error occurred: ' . curl_error($ch);
    } else {
        $decoded_response = json_decode($response, true);
        if (isset($decoded_response['error'])) {
            echo 'API error occurred: ' . $decoded_response['error']['message'];
        } else {
            //print_r($decoded_response);
            $completion = $decoded_response['choices'][0]['message']['content'];
            echo $completion;
        }
    }

    curl_close($ch);
} else {
    //print_r($_POST);
    echo '{
        "error": "Transcript not provided"
      }';
}
