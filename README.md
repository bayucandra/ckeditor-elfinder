<h1>CKEDITOR 4 using elFinder with AWS S3 adapter</h1>

<h2>Working demo</h2>
<a href="https://www.biqdev.com/demo/ckeditor-elfinder/">https://www.biqdev.com/demo/ckeditor-elfinder/</a>

<h2>Steps to be done:</h2>
<ol>
    <li>
    Download CKEditor 4, jQuery, jQuery-UI and setup them accordingly to the HTML page just like this: <a href="https://github.com/bayucandra/ckeditor-elfinder/blob/master/index.html">https://github.com/bayucandra/ckeditor-elfinder/blob/master/index.html</a>
    </li>
    <li>CKEditor JS setup should looks something like: <a href="https://github.com/bayucandra/ckeditor-elfinder/blob/master/app.js">https://github.com/bayucandra/ckeditor-elfinder/blob/master/app.js</a></li>
    <li>Download latest version of elFinder from: <a href="https://studio-42.github.io/elFinder/#elf_l1_RG93bmxvYWRz">https://studio-42.github.io/elFinder/#elf_l1_RG93bmxvYWRz</a> or from their github release page: <a href="https://github.com/Studio-42/elFinder/releases">https://github.com/Studio-42/elFinder/releases</a> ( This project using version: 2.1.46 )</li>
    <li>In your terminal start get into /elFinder/php directory by doing: `cd /elFinder/php`</li>
    <li>Install 'Flysystem' connector using PHP composer by doing: `composer require barryvdh/elfinder-flysystem-driver`</li>
    <li>Install 'AWS S3 SDK' using composer by doing: `composer require league/flysystem-aws-s3-v3`</li>
    <li>Rename /elFinder/php/connector.minimal.php-dist to /elFinder/php/connector.minimal.php</li>
    <li>Setup your connector to use AWS S3 SDK on: /elFinder/php/connector.minimal.php, see working example: <a href="https://github.com/bayucandra/ckeditor-elfinder/blob/master/vendor/elFinder/php/connector.minimal.php">https://github.com/bayucandra/ckeditor-elfinder/blob/master/vendor/elFinder/php/connector.minimal.php</a></li>
    
</ol>