function elFinderInit(){

  var elfNode, elfInstance, dialogName,
    elfUrl = './vendor/elFinder/php/connector.minimal.php', // Your connector's URL
    elfDirHashMap = { // Dialog name / elFinder holder hash Map
      image : '',
      flash : '',
      files : '',
      link  : '',
      fb    : 'l1_Lw' // Fall back target : `/`
    },
    imgShowMaxSize = 40000; // Max image size(px) to show

  // Set image size to show
  function setShowImgSize(url, callback) {
    $('<img/>').attr('src', url).on('load', function() {
      var w = this.naturalWidth,
        h = this.naturalHeight,
        s = imgShowMaxSize;
      if (w > s || h > s) {
        if (w > h) {
          h = Math.floor(h * (s / w));
          w = s;
        } else {
          w = Math.floor(w * (s / h));
          h = s;
        }
      }
      callback({width: w, height: h});
    });
  }

  // Set values to dialog of CKEditor
  function setDialogValue(file, fm) {
    var url = fm.convAbsUrl(file.url),
      dialog = CKEDITOR.dialog.getCurrent(),
      dialogName = dialog._.name,
      tabName = dialog._.currentTabId,
      urlObj;
    if (dialogName === 'image') {
      urlObj = 'txtUrl';
    } else if (dialogName === 'flash') {
      urlObj = 'src';
    } else if (dialogName === 'files' || dialogName === 'link') {
      urlObj = 'url';
    } else if (dialogName === 'image2') {
      urlObj = 'src';
    } else {
      return;
    }
    if (tabName === 'Upload') {
      tabName = 'info';
      dialog.selectPage(tabName);
    }
    dialog.setValueOf(tabName, urlObj, url);
    if (dialogName === 'image' && tabName === 'info') {
      setShowImgSize(url, function(size) {
        dialog.setValueOf('info', 'txtWidth', size.width);
        dialog.setValueOf('info', 'txtHeight', size.height);
        dialog.preview.$.style.width = size.width+'px';
        dialog.preview.$.style.height = size.height+'px';
        dialog.setValueOf('Link', 'txtUrl', url);
        dialog.setValueOf('Link', 'cmbTarget', '_blank');
      });
    } else if (dialogName === 'image2' && tabName === 'info') {
      dialog.setValueOf(tabName, 'alt', file.name + ' (' + elfInstance.formatSize(file.size) + ')');
      setShowImgSize(url, function(size) {
        setTimeout(function() {
          dialog.setValueOf('info', 'width', size.width);
          dialog.setValueOf('info', 'height', size.height);
        }, 100);
      });
    } else if (dialogName === 'files' || dialogName === 'link') {
      try {
        dialog.setValueOf('info', 'linkDisplayText', file.name);
      } catch(e) {}
    }
  }

  // Setup upload tab in CKEditor dialog
  CKEDITOR.on('dialogDefinition', function (event) {
    var dialogName = event.data.name,
      dialogDefinition = event.data.definition,
      tabCount = dialogDefinition.contents.length,
      browseButton;

    if ( dialogName == 'image2' || dialogName == 'link' ) {
      // Remove upload tab
      dialogDefinition.removeContents('Upload');
      dialogDefinition.removeContents('upload');
    }

    for (var i = 0; i < tabCount; i++) {
      try {
        browseButton = dialogDefinition.contents[i].get('browse');
      } catch(e) {
        browseButton = null;
      }

      if (browseButton !== null) {
        browseButton.hidden = false;
        browseButton.onClick = function (dialog, i) {
          dialogName = CKEDITOR.dialog.getCurrent()._.name;
          if (dialogName === 'image2') {
            dialogName = 'image';
          }
          if (elfNode) {
            if (elfDirHashMap[dialogName] && elfDirHashMap[dialogName] !== elfInstance.cwd().hash) {
              elfInstance.request({
                data     : {cmd  : 'open', target : elfDirHashMap[dialogName]},
                notify : {type : 'open', cnt : 1, hideCnt : true},
                syncOnFail : true
              });
            }
            elfNode.dialog('open');
          }
        }
      }
    }
  });

  // Create elFinder dialog for CKEditor
  CKEDITOR.on('instanceReady', function(e) {
    elfNode = $('<div style="padding:0;">');
    elfNode.dialog({
      autoOpen: false,
      modal: true,
      width: '80%',
      title: 'Server File Manager',
      create: function (event, ui) {
        var startPathHash = (elfDirHashMap[dialogName] && elfDirHashMap[dialogName])? elfDirHashMap[dialogName] : '';
        // elFinder configure
        elfInstance = $(this).elfinder({
          startPathHash: startPathHash,
          useBrowserHistory: false,
          resizable: false,
          width: '100%',
          url: elfUrl,
          lang: 'en',
          dialogContained : true,
          getFileCallback: function(file, fm) {
            setDialogValue(file, fm);
            elfNode.dialog('close');
          }
        }).elfinder('instance');
      },
      open: function() {
        elfNode.find('div.elfinder-toolbar input').blur();
        setTimeout(function(){
          elfInstance.enable();
        }, 100);
      },
      resizeStop: function() {
        elfNode.trigger('resize');
      }
    }).parent().css({'zIndex':'11000'});

    // CKEditor instance
    var cke = e.editor;

    // Setup the procedure when DnD image upload was completed
    cke.widgets.registered.uploadimage.onUploaded = function(upload){
      var self = this;
      setShowImgSize(upload.url, function(size) {
        self.replaceWith('<img src="'+encodeURI(upload.url)+'" width="'+size.width+'" height="'+size.height+'"></img>');
      });
    };

    // Setup the procedure when send DnD image upload data to elFinder's connector
    cke.on('fileUploadRequest', function(e){
      var target = elfDirHashMap['image']? elfDirHashMap['image'] : elfDirHashMap['fb'],
        fileLoader = e.data.fileLoader,
        xhr = fileLoader.xhr,
        formData = new FormData();
      e.stop();
      xhr.open('POST', fileLoader.uploadUrl, true);
      formData.append('cmd', 'upload');
      formData.append('target', target);
      formData.append('upload[]', fileLoader.file, fileLoader.fileName);
      xhr.send(formData);
    }, null, null, 4);

    // Setup the procedure when got DnD image upload response
    cke.on('fileUploadResponse', function(e){
      var file;
      e.stop();
      var data = e.data,
        res = JSON.parse(data.fileLoader.xhr.responseText);
      if (!res.added || res.added.length < 1) {
        data.message = 'Can not upload.';
        e.cancel();
      } else {
        elfInstance.exec('reload');
        file = res.added[0];
        if (file.url && file.url !== '1') {
          data.url = file.url;
          try {
            data.url = decodeURIComponent(data.url);
          } catch(e) {}
        } else {
          data.url = elfInstance.options.url + ((elfInstance.options.url.indexOf('?') === -1)? '?' : '&') + 'cmd=file&target=' + file.hash;
        }
        data.url = elfInstance.convAbsUrl(data.url);
      }
    });
  });

}


elFinderInit();

CKEDITOR.replace('s3-adapter',{
  filebrowserBrowseUrl: '#',
  extraPlugins: 'uploadimage,image2',
  filebrowserUploadUrl: './elFinder/php/connector.minimal.php',
  imageUploadUrl: './elFinder/php/connector.minimal.php'
});




$('.loading').hide();