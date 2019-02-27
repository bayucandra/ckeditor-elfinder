<?php

error_reporting(0); // Set E_ALL for debuging
// load composer autoload before load elFinder autoload If you need composer
require './vendor/autoload.php';

use Aws\S3\S3Client;
use League\Flysystem\AwsS3v3\AwsS3Adapter;
use League\Flysystem\Filesystem;


// elFinder autoload
require './autoload.php';
// ===============================================

/**
 * Simple function to demonstrate how to control file access using "accessControl" callback.
 * This method will disable accessing files/folders starting from '.' (dot)
 *
 * @param  string    $attr    attribute name (read|write|locked|hidden)
 * @param  string    $path    absolute file path
 * @param  string    $data    value of volume option `accessControlData`
 * @param  object    $volume  elFinder volume driver object
 * @param  bool|null $isDir   path is directory (true: directory, false: file, null: unknown)
 * @param  string    $relpath file path relative to volume root directory started with directory separator
 * @return bool|null
 **/
function access($attr, $path, $data, $volume, $isDir, $relpath) {
	$basename = basename($path);
	return $basename[0] === '.'                  // if file/folder begins with '.' (dot)
			 && strlen($relpath) !== 1           // but with out volume root
		? !($attr == 'read' || $attr == 'write') // set read+write to false, other (locked+hidden) set to true
		:  null;                                 // else elFinder decide it itself
}

//!!!!!!!!!!!!!!AWS CONFIG HERE!!!!!!!!!!!!!!!
$aws_config = [
    "key" => "key",
    "secret" => "secret",
    "region" => "region-name",
    "bucket" => "bucket-name"
];
$aws_url = "http://" . $aws_config["bucket"] . ".s3." . $aws_config["region"] . ".amazonaws.com";
$client = new S3Client(
    Array ( "driver" => "s3",
        "key" => $aws_config["key"],
        "secret" => $aws_config["secret"],
        "region" => $aws_config["region"],
        "bucket" => $aws_config["bucket"],
        "url" => $aws_url,
        "version" => "latest",
        "credentials" => Array (
            "key" => $aws_config["key"],
            "secret" => $aws_config["secret"]
        )
    )

);
$adapter = new AwsS3Adapter($client, 'biqdev.com');
$filesystem = new Filesystem($adapter, Array ( "url" => $aws_url ));

// Documentation for connector options:
// https://github.com/Studio-42/elFinder/wiki/Connector-configuration-options
$opts = array(
	// 'debug' => true,
	'roots' => [

        [
            'driver' => 'Flysystem',
            'alias' => 'BIQDev.com',//Change to anything you like
            'filesystem' => $filesystem,
            'tmbURL' => 'self'
        ]

    ]
);

// run elFinder
$connector = new elFinderConnector(new elFinder($opts));
$connector->run();

