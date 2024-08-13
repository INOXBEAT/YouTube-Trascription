var player;
var subtitles = [];
var subtitleElements = [];

// Función llamada por la API de YouTube para inicializar el reproductor
function onYouTubeIframeAPIReady() {}

// Función llamada cuando el reproductor de YouTube está listo
function onPlayerReady(event) {
    event.target.playVideo();
    checkTime(); // Iniciar la función de tiempo para resaltar subtítulos
}

// Función para verificar el tiempo del video y resaltar subtítulos
function checkTime() {
    var currentTime = player.getCurrentTime();
    subtitles.forEach(function (subtitle, index) {
        var subtitleElement = subtitleElements[index];
        var nextSubtitleTime = (index + 1 < subtitles.length) ? subtitles[index + 1].time : player.getDuration();

        if (currentTime >= subtitle.time && currentTime < nextSubtitleTime) {
            subtitleElement.classList.add('highlight');
        } else {
            subtitleElement.classList.remove('highlight');
        }
    });
    requestAnimationFrame(checkTime); // Continuar revisando el tiempo
}

// Manejar el envío del formulario
document.getElementById('video-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var videoUrl = document.getElementById('videoUrl').value;
    var fileInput = document.getElementById('fileInput');
    var file = fileInput.files[0];

    if (!file) {
        alert("Por favor, cargue un archivo de transcripción.");
        return;
    }

    if (!videoUrl) {
        alert("Por favor, ingrese una URL de YouTube válida.");
        return;
    }

    // Extraer el ID del video de YouTube de la URL
    function extractVideoId(url) {
        var videoIdMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        return videoIdMatch ? videoIdMatch[1] : null;
    }

    var videoId = extractVideoId(videoUrl);
    if (!videoId) {
        alert("URL de YouTube inválida.");
        return;
    }

    // Destruir el reproductor existente si ya hay uno
    if (player) {
        player.destroy();
        document.getElementById('full-transcript-container').innerHTML = "";
        subtitleElements = [];
    }

    // Crear un nuevo reproductor de YouTube
    player = new YT.Player('player', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        events: {
            'onReady': onPlayerReady
        }
    });

    // Procesar el archivo de transcripción
    const reader = new FileReader();
    reader.onload = function (e) {
        const lines = e.target.result.split('\n');
        subtitles = [];
        let time = null;

        // Analizar el archivo de transcripción
        lines.forEach(line => {
            line = line.trim();
            const timeMatch = line.match(/^(\d{1,2}):(\d{2})$/);
            if (timeMatch) {
                const minutes = parseInt(timeMatch[1], 10);
                const seconds = parseInt(timeMatch[2], 10);
                time = minutes * 60 + seconds;
            } else if (time !== null) {
                subtitles.push({ time: time, text: line });
                time = null;
            }
        });

        // Mostrar la transcripción completa
        displayFullTranscript();
    };

    reader.readAsText(file);
});

// Función para mostrar la transcripción completa
function displayFullTranscript() {
    var fullTranscriptContainer = document.getElementById('full-transcript-container');
    fullTranscriptContainer.innerHTML = ''; // Limpiar contenido anterior
    subtitleElements = [];

    subtitles.forEach(function (subtitle, index) {
        var p = document.createElement('p');
        var a = document.createElement('a');
        a.innerText = subtitle.text;
        a.href = "#";
        a.onclick = function () {
            player.seekTo(subtitle.time, true);
            return false;
        };
        p.appendChild(a);
        fullTranscriptContainer.appendChild(p);
        subtitleElements.push(p);
    });
}

/* 13/agosto/2024*/ //función que genere el contenido HTML y lo convierta en un archivo descargable.

document.getElementById('download-html').addEventListener('click', function () {
    var videoUrl = document.getElementById('videoUrl').value;
    var fileInput = document.getElementById('fileInput');
    var file = fileInput.files[0];

    if (!file) {
        alert("Por favor, cargue un archivo de transcripción.");
        return;
    }

    if (!videoUrl) {
        alert("Por favor, ingrese una URL de YouTube válida.");
        return;
    }

    // Extraer el ID del video de YouTube de la URL
    function extractVideoId(url) {
        var videoIdMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        return videoIdMatch ? videoIdMatch[1] : null;
    }

    var videoId = extractVideoId(videoUrl);
    if (!videoId) {
        alert("URL de YouTube inválida.");
        return;
    }

    // Procesar el archivo de transcripción
    const reader = new FileReader();
    reader.onload = function (e) {
        const lines = e.target.result.split('\n');
        let subtitles = [];
        let time = null;

        // Analizar el archivo de transcripción
        lines.forEach(line => {
            line = line.trim();
            const timeMatch = line.match(/^(\d{1,2}):(\d{2})$/);
            if (timeMatch) {
                const minutes = parseInt(timeMatch[1], 10);
                const seconds = parseInt(timeMatch[2], 10);
                time = minutes * 60 + seconds;
            } else if (time !== null) {
                subtitles.push({ time: time, text: line });
                time = null;
            }
        });

        // Crear contenido HTML
        var htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Video de YouTube con Subtítulos Dinámicos</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            color: #333;
            margin: 0;
            padding: 0;
        }

        h1 {
            text-align: center;
            color: #003057;
            margin: 20px 0;
        }

        .video-container {
            display: flex;
            justify-content: space-between;
        }

        .video-container #player {
            flex: 0 0 70%;
            height: 360px;
        }

        .video-container #full-transcript-container {
            flex: 0 0 30%;
            max-height: 360px;
            background-color: #f9f9f9;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 4px;
            overflow-y: auto;
        }

        .highlight {
            background-color: yellow;
        }
    </style>
    <script src="https://www.youtube.com/iframe_api"></script>
</head>
<body>
    <div class="container">
        <h1>Video de YouTube con Subtítulos Dinámicos</h1>
        <div class="video-container">
            <div id="player"></div>
            <div id="full-transcript-container">`;

        // Agregar subtítulos al contenido HTML
        subtitles.forEach(function (subtitle) {
            htmlContent += `<p>${subtitle.text}</p>`;
        });

        htmlContent += `
            </div>
        </div>
    </div>
    <script>
        var player;
        var subtitles = ${JSON.stringify(subtitles)};
        var subtitleElements = [];

        function onYouTubeIframeAPIReady() {
            player = new YT.Player('player', {
                height: '100%',
                width: '100%',
                videoId: '${videoId}',
                events: {
                    'onReady': onPlayerReady
                }
            });
        }

        function onPlayerReady(event) {
            event.target.playVideo();
            checkTime();
        }

        function checkTime() {
            var currentTime = player.getCurrentTime();
            subtitles.forEach(function (subtitle, index) {
                var subtitleElement = subtitleElements[index];
                var nextSubtitleTime = (index + 1 < subtitles.length) ? subtitles[index + 1].time : player.getDuration();

                if (currentTime >= subtitle.time && currentTime < nextSubtitleTime) {
                    subtitleElement.classList.add('highlight');
                } else {
                    subtitleElement.classList.remove('highlight');
                }
            });
            requestAnimationFrame(checkTime);
        }

        function displayFullTranscript() {
            var fullTranscriptContainer = document.getElementById('full-transcript-container');
            fullTranscriptContainer.innerHTML = '';
            subtitles.forEach(function (subtitle, index) {
                var p = document.createElement('p');
                p.innerText = subtitle.text;
                fullTranscriptContainer.appendChild(p);
                subtitleElements.push(p);
            });
        }

        displayFullTranscript();
    </script>
</body>
</html>`;

        // Crear un blob con el contenido HTML
        var blob = new Blob([htmlContent], { type: 'text/html' });

        // Crear un enlace de descarga
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'video_subtitulos.html';

        // Simular un clic en el enlace para iniciar la descarga
        link.click();
    };

    reader.readAsText(file);
});
