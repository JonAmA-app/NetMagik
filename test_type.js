import { exec } from 'child_process';

function simulateTypewriter(text) {
    const base64Text = Buffer.from(text, 'utf8').toString('base64');

    const psScript = `
        $bytes = [System.Convert]::FromBase64String('${base64Text}');
        $text = [System.Text.Encoding]::UTF8.GetString($bytes);

        Start-Sleep -m 400;

        $wshell = New-Object -ComObject wscript.shell;

        foreach($c in $text.ToCharArray()) {
            $s = $c.ToString();
            if ('+^%~{}()[]'.Contains($s)) { 
                $s = '{' + $s + '}';
            }
            $wshell.SendKeys($s);
            Start-Sleep -m 20;
        }
    `.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

    console.log("CMD", psScript);
    exec(`powershell -NoProfile -NonInteractive -WindowStyle Hidden -Command "${psScript}"`, (err, stdout, stderr) => {
        if (err) console.error("Typewriter Error:", err);
        if (stdout) console.log("STDOUT", stdout);
        if (stderr) console.error("STDERR", stderr);
    });
}

simulateTypewriter("WScript Hello World!");
