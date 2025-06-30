# 🍓 Guida Completa: Raspberry Pi Cloud Setup con Ubuntu 24.04

## 📖 **Introduzione**
Questa guida ti aiuterà a trasformare il tuo Raspberry Pi con Ubuntu 24.04 in un cloud personale da 1TB, accessibile da qualsiasi dispositivo nel mondo tramite internet.

**Cosa otterrai:**
- ☁️ Cloud personale con 1TB di spazio
- 🌍 Accesso da qualsiasi dispositivo
- 🔒 Privacy totale (dati a casa tua)
- 📱 App mobile per sincronizzazione
- 💰 Costo zero (solo elettricità)

---

## 🚀 **FASE 1: Preparazione Sistema Base**
*Tempo stimato: 15 minuti*

### **Passaggio 1.1: Aggiornamento Sistema**
```bash
sudo apt update && sudo apt upgrade -y
```
**Spiegazione:** 
- `apt update`: Aggiorna la lista dei pacchetti disponibili
- `apt upgrade -y`: Installa tutti gli aggiornamenti disponibili (-y conferma automaticamente)
- Questo assicura che il sistema sia aggiornato con le ultime patch di sicurezza

```bash
sudo apt autoremove -y
```
**Spiegazione:** Rimuove i pacchetti non più necessari per liberare spazio

```bash
sudo reboot
```
**Spiegazione:** Riavvia il sistema per applicare tutti gli aggiornamenti del kernel

### **Passaggio 1.2: Installazione Strumenti Base**
```bash
sudo apt install -y curl wget git nano htop ufw fail2ban
```
**Spiegazione di ogni strumento:**
- `curl`: Tool per fare richieste HTTP (scarica file da internet)
- `wget`: Altro tool per scaricare file
- `git`: Sistema di controllo versione
- `nano`: Editor di testo semplice
- `htop`: Monitor delle risorse di sistema
- `ufw`: Firewall semplificato per Ubuntu
- `fail2ban`: Protezione da attacchi brute force

```bash
sudo apt install -y software-properties-common apt-transport-https ca-certificates
```
**Spiegazione:**
- `software-properties-common`: Gestione repository software
- `apt-transport-https`: Supporto HTTPS per apt
- `ca-certificates`: Certificati per connessioni sicure

### **Passaggio 1.3: Configurazione Storage 1TB**

**Prima verifichiamo che dischi abbiamo:**
```bash
lsblk
```
**Spiegazione:** Mostra tutti i dischi e partizioni in formato albero

```bash
sudo fdisk -l
```
**Spiegazione:** Lista dettagliata di tutti i dischi con dimensioni e tipi

**Creiamo la directory di montaggio:**
```bash
sudo mkdir -p /mnt/cloud-storage
```
**Spiegazione:** 
- `mkdir -p`: Crea directory (anche quelle parent se non esistono)
- `/mnt/cloud-storage`: Directory dove monteremo il disco da 1TB

**Montiamo il disco (sostituisci /dev/sda1 con il tuo disco):**
```bash
sudo mount /dev/sda1 /mnt/cloud-storage
```
**Spiegazione:** 
- `mount`: Collega un filesystem a una directory
- `/dev/sda1`: Il tuo disco da 1TB (potrebbe essere diverso, controlla con `lsblk`)
- `/mnt/cloud-storage`: Dove sarà accessibile il disco

**Montaggio automatico al riavvio:**
```bash
echo "/dev/sda1 /mnt/cloud-storage ext4 defaults 0 2" | sudo tee -a /etc/fstab
```
**Spiegazione:**
- `/etc/fstab`: File che dice al sistema quali dischi montare automaticamente
- `ext4`: Tipo di filesystem
- `defaults`: Opzioni standard di montaggio
- `0 2`: Opzioni per backup e controllo filesystem

---

## 🌐 **FASE 2: Installazione Stack Web**
*Tempo stimato: 20 minuti*

### **Passaggio 2.1: Apache Web Server**
```bash
sudo apt install -y apache2
```
**Spiegazione:** Apache è il web server che servirà le pagine web del nostro cloud

```bash
sudo systemctl enable apache2
```
**Spiegazione:** Fa sì che Apache si avvii automaticamente al boot del sistema

```bash
sudo systemctl start apache2
```
**Spiegazione:** Avvia immediatamente il servizio Apache

```bash
sudo ufw allow 'Apache Full'
```
**Spiegazione:** 
- Apre le porte 80 (HTTP) e 443 (HTTPS) nel firewall
- Necessario per accedere al web server da internet

### **Passaggio 2.2: Database MySQL/MariaDB**
```bash
sudo apt install -y mariadb-server
```
**Spiegazione:** 
- MariaDB è un database che memorizza le configurazioni e metadati di Nextcloud
- È compatibile al 100% con MySQL ma open source

```bash
sudo systemctl enable mariadb
sudo systemctl start mariadb
```
**Spiegazione:** Abilita e avvia il servizio database

**Configurazione sicurezza database:**
```bash
sudo mysql_secure_installation
```
**Spiegazione:** Script interattivo che:
- Imposta password per utente root
- Rimuove utenti anonimi
- Disabilita login root da remoto
- Rimuove database di test

**Risposte consigliate:**
- Enter current password: *[INVIO]* (nessuna password iniziale)
- Set root password: **Y** (sì, imposta password)
- Remove anonymous users: **Y**
- Disallow root login remotely: **Y**  
- Remove test database: **Y**
- Reload privilege tables: **Y**

### **Passaggio 2.3: PHP 8.3**
```bash
sudo apt install -y php php-mysql php-xml php-zip php-curl php-mbstring
```
**Spiegazione di ogni modulo PHP:**
- `php`: Linguaggio di programmazione per web
- `php-mysql`: Connessione tra PHP e database
- `php-xml`: Gestione file XML
- `php-zip`: Compressione/decompressione file
- `php-curl`: Richieste HTTP da PHP
- `php-mbstring`: Gestione caratteri multibyte

```bash
sudo apt install -y php-gd php-intl php-bcmath php-gmp php-imagick
```
**Spiegazione moduli aggiuntivi:**
- `php-gd`: Manipolazione immagini
- `php-intl`: Internazionalizzazione
- `php-bcmath`: Calcoli matematici precisione arbitraria
- `php-gmp`: Operazioni matematiche grandi numeri
- `php-imagick`: Elaborazione avanzata immagini

```bash
sudo systemctl restart apache2
```
**Spiegazione:** Riavvia Apache per caricare i moduli PHP

---

## ☁️ **FASE 3: Installazione Nextcloud**
*Tempo stimato: 30 minuti*

### **Passaggio 3.1: Download Nextcloud**
```bash
cd /tmp
```
**Spiegazione:** Andiamo nella directory temporanea per il download

```bash
wget https://download.nextcloud.com/server/releases/latest.tar.bz2
```
**Spiegazione:** 
- Scarica l'ultima versione di Nextcloud
- Il file è compresso in formato .tar.bz2

```bash
tar -xjf latest.tar.bz2
```
**Spiegazione:**
- `tar`: Tool per gestire archivi
- `-x`: Estrae i file
- `-j`: Decomprime bzip2
- `-f`: Specifica il file da processare

```bash
sudo mv nextcloud /var/www/html/
```
**Spiegazione:** 
- Sposta la cartella nextcloud in `/var/www/html/`
- Questa è la directory standard per i siti web Apache

```bash
sudo chown -R www-data:www-data /var/www/html/nextcloud
```
**Spiegazione:**
- `chown`: Cambia proprietario dei file
- `-R`: Ricorsivo (tutti i file e sottocartelle)
- `www-data`: Utente con cui gira Apache

```bash
sudo chmod -R 755 /var/www/html/nextcloud
```
**Spiegazione:**
- `chmod`: Cambia permessi dei file
- `755`: Proprietario può tutto (7), gruppo e altri possono leggere/eseguire (5)

### **Passaggio 3.2: Configurazione Database**
```bash
sudo mysql -u root -p
```
**Spiegazione:** 
- Accede al database come utente root
- `-p` chiede la password che hai impostato prima

**Comandi SQL da eseguire nel database:**
```sql
CREATE DATABASE nextcloud;
```
**Spiegazione:** Crea un database chiamato "nextcloud"

```sql
CREATE USER 'nextclouduser'@'localhost' IDENTIFIED BY 'METTI-QUI-PASSWORD-FORTE';
```
**Spiegazione:** 
- Crea un utente per Nextcloud
- ⚠️ **IMPORTANTE**: Sostituisci "METTI-QUI-PASSWORD-FORTE" con una password sicura!

```sql
GRANT ALL PRIVILEGES ON nextcloud.* TO 'nextclouduser'@'localhost';
```
**Spiegazione:** Dà all'utente tutti i permessi sul database nextcloud

```sql
FLUSH PRIVILEGES;
```
**Spiegazione:** Applica immediatamente le modifiche ai permessi

```sql
EXIT;
```
**Spiegazione:** Esce dal client MySQL

### **Passaggio 3.3: Configurazione Virtual Host Apache**
```bash
sudo nano /etc/apache2/sites-available/nextcloud.conf
```
**Spiegazione:** 
- Crea file di configurazione per il sito Nextcloud
- `nano` è l'editor di testo che useremo

**Contenuto del file (copia e incolla):**
```apache
<VirtualHost *:80>
    ServerName your-raspberry.local
    DocumentRoot /var/www/html/nextcloud
    
    <Directory /var/www/html/nextcloud>
        Options +FollowSymlinks
        AllowOverride All
        Require all granted
        
        <IfModule mod_dav.c>
            Dav off
        </IfModule>
        
        SetEnv HOME /var/www/html/nextcloud
        SetEnv HTTP_HOME /var/www/html/nextcloud
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/nextcloud_error.log
    CustomLog ${APACHE_LOG_DIR}/nextcloud_access.log combined
</VirtualHost>
```

**Spiegazione configurazione:**
- `VirtualHost *:80`: Risponde su porta 80 (HTTP)
- `ServerName`: Nome del server (cambieremo dopo)
- `DocumentRoot`: Directory dei file web
- `AllowOverride All`: Permette file .htaccess
- `ErrorLog/CustomLog`: File di log per debug

**Salva il file:** Premi `Ctrl+X`, poi `Y`, poi `INVIO`

**Attivazione sito e moduli:**
```bash
sudo a2ensite nextcloud.conf
```
**Spiegazione:** Abilita il sito Nextcloud in Apache

```bash
sudo a2enmod rewrite headers env dir mime
```
**Spiegazione di ogni modulo:**
- `rewrite`: URL rewriting (per URL puliti)
- `headers`: Manipolazione header HTTP
- `env`: Variabili d'ambiente
- `dir`: Gestione directory index
- `mime`: Tipi MIME dei file

```bash
sudo systemctl restart apache2
```
**Spiegazione:** Riavvia Apache per applicare tutte le modifiche

---

## 🔧 **FASE 4: Configurazione Storage Cloud**
*Tempo stimato: 10 minuti*

### **Passaggio 4.1: Directory Dati Nextcloud**
```bash
sudo mkdir -p /mnt/cloud-storage/nextcloud-data
```
**Spiegazione:** 
- Crea directory dove Nextcloud salverà tutti i file degli utenti
- Sarà sul disco da 1TB che abbiamo montato

```bash
sudo chown -R www-data:www-data /mnt/cloud-storage/nextcloud-data
```
**Spiegazione:** Dà proprietà della directory ad Apache (www-data)

```bash
sudo chmod -R 750 /mnt/cloud-storage/nextcloud-data
```
**Spiegazione:**
- `750`: Proprietario tutto (7), gruppo legge/esegue (5), altri niente (0)
- Più sicuro per i dati privati

### **Passaggio 4.2: Ottimizzazione PHP**
```bash
sudo nano /etc/php/8.3/apache2/php.ini
```
**Spiegazione:** Modifica configurazione PHP per gestire file grandi

**Trova e modifica queste righe (usa Ctrl+W per cercare):**
```ini
upload_max_filesize = 1G
post_max_size = 1G
max_execution_time = 300
memory_limit = 512M
```

**Spiegazione di ogni parametro:**
- `upload_max_filesize`: Dimensione massima file caricabili (1GB)
- `post_max_size`: Dimensione massima dati POST (1GB)
- `max_execution_time`: Tempo massimo esecuzione script (5 minuti)
- `memory_limit`: Memoria massima per script PHP (512MB)

```bash
sudo systemctl restart apache2
```
**Spiegazione:** Riavvia Apache per applicare nuove impostazioni PHP

---

## 🌍 **FASE 5: Accesso Remoto e Sicurezza**
*Tempo stimato: 25 minuti*

### **Passaggio 5.1: DuckDNS per IP Dinamico**

**Prima vai su https://www.duckdns.org:**
1. Fai login con Google/GitHub
2. Crea un dominio (es: "tuodominio")
3. Copia il TOKEN che ti viene dato

```bash
mkdir -p /home/ubuntu/duckdns
cd /home/ubuntu/duckdns
```
**Spiegazione:** Crea directory per script DuckDNS

```bash
nano duck.sh
```
**Spiegazione:** Crea script per aggiornare IP dinamico

**Contenuto del file (sostituisci TUO-DOMINIO e TUO-TOKEN):**
```bash
#!/bin/bash
echo url="https://www.duckdns.org/update?domains=TUO-DOMINIO&token=TUO-TOKEN&ip=" | curl -k -o ~/duckdns/duck.log -K -
```

**Spiegazione:**
- Script che invia a DuckDNS il tuo IP attuale
- DuckDNS associa il tuo dominio all'IP del router

```bash
chmod 700 duck.sh
```
**Spiegazione:** Rende lo script eseguibile (solo per il proprietario)

```bash
./duck.sh
```
**Spiegazione:** Testa lo script per verificare che funzioni

**Automazione aggiornamento:**
```bash
crontab -e
```
**Spiegazione:** Apre editor per job automatici

**Aggiungi questa riga alla fine:**
```cron
*/5 * * * * /home/ubuntu/duckdns/duck.sh >/dev/null 2>&1
```
**Spiegazione:** 
- Esegue lo script ogni 5 minuti
- `>/dev/null 2>&1` nasconde l'output

### **Passaggio 5.2: Configurazione Firewall**
```bash
sudo ufw enable
```
**Spiegazione:** Attiva il firewall Ubuntu

```bash
sudo ufw allow ssh
```
**Spiegazione:** Permette connessioni SSH (per accedere da remoto al Raspberry)

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```
**Spiegazione:**
- Porta 80: HTTP (accesso web normale)
- Porta 443: HTTPS (accesso web sicuro)

```bash
sudo ufw status
```
**Spiegazione:** Mostra stato del firewall e regole attive

### **Passaggio 5.3: Fail2Ban per Sicurezza**
```bash
sudo nano /etc/fail2ban/jail.local
```
**Spiegazione:** Configura protezione da attacchi brute force

**Contenuto del file:**
```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log

[apache-auth]
enabled = true
port = http,https
logpath = /var/log/apache2/*error.log
```

**Spiegazione configurazione:**
- `bantime = 3600`: Banna IP per 1 ora dopo attacco
- `findtime = 600`: Considera tentativi negli ultimi 10 minuti
- `maxretry = 3`: Massimo 3 tentativi falliti
- `[sshd]`: Protegge accesso SSH
- `[apache-auth]`: Protegge accesso web

```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```
**Spiegazione:** Avvia e abilita Fail2Ban

---

## 🔒 **FASE 6: Certificato SSL**
*Tempo stimato: 15 minuti*

### **Passaggio 6.1: Installazione Certbot**
```bash
sudo apt install -y snapd
```
**Spiegazione:** Snap è un sistema di pacchetti moderno

```bash
sudo snap install core; sudo snap refresh core
```
**Spiegazione:** Installa/aggiorna il core di snap

```bash
sudo snap install --classic certbot
```
**Spiegazione:** Installa Certbot (tool per certificati SSL gratuiti)

```bash
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```
**Spiegazione:** Crea link simbolico per usare certbot da terminale

### **Passaggio 6.2: Configurazione Router (PRIMA del certificato)**

**⚠️ IMPORTANTE: Prima di continuare devi configurare il router!**

1. **Accedi al router** (solitamente 192.168.1.1 o 192.168.0.1)
2. **Trova sezione "Port Forwarding" o "Virtual Servers"**
3. **Aggiungi queste regole:**
   - **Servizio:** HTTP
   - **Porta Esterna:** 80
   - **IP Interno:** [IP del Raspberry Pi]
   - **Porta Interna:** 80
   
   - **Servizio:** HTTPS  
   - **Porta Esterna:** 443
   - **IP Interno:** [IP del Raspberry Pi]
   - **Porta Interna:** 443

4. **Salva e riavvia router**

**Come trovare IP del Raspberry:**
```bash
ip addr show | grep "inet 192"
```
**Spiegazione:** Mostra gli IP locali del Raspberry

### **Passaggio 6.3: Ottenimento Certificato SSL**
```bash
sudo certbot --apache -d tuodominio.duckdns.org
```
**Spiegazione:**
- `--apache`: Configura automaticamente Apache
- `-d tuodominio.duckdns.org`: Il tuo dominio DuckDNS

**Durante il processo ti chiederà:**
1. **Email**: Per notifiche di scadenza
2. **Terms of Service**: Digita "Y"
3. **Marketing emails**: Digita "N" (opzionale)
4. **Redirect HTTP to HTTPS**: Digita "2" (sì, sempre HTTPS)

**Spiegazione processo:**
- Certbot verifica che controlli il dominio
- Ottiene certificato gratuito da Let's Encrypt
- Configura Apache per HTTPS automaticamente

---

## 🏠 **FASE 7: IP Statico per Raspberry**
*Tempo stimato: 10 minuti*

### **Passaggio 7.1: Verifica Configurazione di Rete**
```bash
ip addr show
```
**Spiegazione:** Mostra configurazione rete attuale

```bash
ip route show
```
**Spiegazione:** Mostra gateway (IP del router)

### **Passaggio 7.2: Configurazione IP Statico**
```bash
sudo nano /etc/netplan/01-netcfg.yaml
```
**Spiegazione:** File di configurazione rete per Ubuntu

**Contenuto del file (modifica IP secondo la tua rete):**
```yaml
network:
  version: 2
  ethernets:
    eth0:
      addresses: [192.168.1.100/24]  # IP fisso che scegli
      gateway4: 192.168.1.1         # IP del tuo router
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]  # DNS Google
```

**Spiegazione:**
- `192.168.1.100/24`: IP fisso per il Raspberry (scegli uno libero)
- `192.168.1.1`: Solitamente IP del router (verifica con `ip route`)
- `8.8.8.8, 8.8.4.4`: Server DNS di Google

```bash
sudo netplan apply
```
**Spiegazione:** Applica la nuova configurazione di rete

**Verifica che funzioni:**
```bash
ping google.com
```
**Spiegazione:** Testa connessione internet

---

## 🚀 **FASE 8: Setup Nextcloud via Web**
*Tempo stimato: 10 minuti*

### **Passaggio 8.1: Primo Accesso**

**Apri browser e vai a:** `https://tuodominio.duckdns.org`

**Se ottieni errore di sicurezza:**
- È normale la prima volta
- Clicca "Avanzate" → "Procedi verso il sito"

### **Passaggio 8.2: Configurazione Iniziale**

**Ti apparirà la pagina di setup di Nextcloud:**

1. **Account Amministratore:**
   - **Username:** admin (o quello che preferisci)
   - **Password:** Scegli password forte!

2. **Directory Dati:**
   - Cambia da `/var/www/html/nextcloud/data`
   - A: `/mnt/cloud-storage/nextcloud-data`
   
3. **Configurazione Database:**
   - **Database:** MySQL/MariaDB
   - **Username database:** nextclouduser
   - **Password database:** La password che hai impostato prima
   - **Nome database:** nextcloud
   - **Host database:** localhost

4. **Clicca "Installa"**

**Spiegazione:**
- Nextcloud creerà tutte le tabelle nel database
- Configurerà l'ambiente iniziale
- Può richiedere alcuni minuti

### **Passaggio 8.3: Post-Installazione**

**Dopo l'installazione, Nextcloud ti chiederà:**
- **Installare app consigliate:** Scegli "Sì"
- **App include:** Calendar, Contacts, Mail, ecc.

---

## 📱 **FASE 9: App e Client**
*Tempo stimato: 5 minuti*

### **Passaggio 9.1: App Mobile**

**Android:**
- Vai su Google Play Store
- Cerca "Nextcloud"
- Installa l'app ufficiale

**iOS:**
- Vai su App Store  
- Cerca "Nextcloud"
- Installa l'app ufficiale

**Configurazione app:**
- **Server URL:** `https://tuodominio.duckdns.org`
- **Username:** admin (o quello che hai scelto)
- **Password:** La tua password

### **Passaggio 9.2: Client Desktop (Opzionale)**

**Download:**
- Vai su: https://nextcloud.com/install/
- Scarica client per Windows/Mac/Linux

**Configurazione:**
- **Server URL:** `https://tuodominio.duckdns.org`
- **Username/Password:** Come sopra
- **Cartella locale:** Scegli dove sincronizzare

---

## 🔧 **FASE 10: Ottimizzazioni**
*Tempo estimato: 10 minuti*

### **Passaggio 10.1: Cron Job per Nextcloud**
```bash
sudo crontab -u www-data -e
```
**Spiegazione:** 
- Configura job automatici per l'utente www-data
- Necessario per manutenzione automatica Nextcloud

**Aggiungi questa riga:**
```cron
*/5 * * * * php /var/www/html/nextcloud/cron.php
```
**Spiegazione:** 
- Esegue script di manutenzione ogni 5 minuti
- Serve per sync, pulizia, notifiche, ecc.

### **Passaggio 10.2: Cache Redis (Prestazioni)**
```bash
sudo apt install -y redis-server php-redis
```
**Spiegazione:** 
- Redis è un database in memoria per cache
- Velocizza molto Nextcloud

```bash
sudo systemctl enable redis-server
```
**Spiegazione:** Abilita Redis all'avvio

**Configurazione Nextcloud per Redis:**
```bash
sudo nano /var/www/html/nextcloud/config/config.php
```
**Spiegazione:** File di configurazione principale di Nextcloud

**Aggiungi prima dell'ultima riga `);`:**
```php
'memcache.local' => '\OC\Memcache\Redis',
'redis' => array(
    'host' => 'localhost',
    'port' => 6379,
),
```

**Spiegazione:** 
- Dice a Nextcloud di usare Redis per cache
- Velocizza caricamento pagine e operazioni

---

## ✅ **VERIFICA FINALE**

### **Checklist Completa:**
```
□ Sistema Ubuntu aggiornato
□ Disco 1TB montato correttamente
□ Apache + PHP + MySQL funzionanti
□ Nextcloud installato e accessibile
□ DuckDNS configurato e funzionante
□ Port forwarding router attivo
□ Certificato SSL installato (HTTPS)
□ Firewall e Fail2Ban configurati
□ IP statico configurato
□ Accesso web da https://tuodominio.duckdns.org
□ App mobile collegata
□ Cron job configurato
□ Cache Redis attiva
```

### **Test Finali:**
```bash
# Verifica servizi attivi
sudo systemctl status apache2 mariadb redis-server

# Verifica firewall
sudo ufw status

# Verifica Fail2Ban
sudo fail2ban-client status

# Test accesso esterno
curl -I https://tuodominio.duckdns.org
```

### **Test da dispositivi esterni:**
1. **Disattiva WiFi del telefono** (usa rete mobile)
2. **Apri browser** e vai a `https://tuodominio.duckdns.org`
3. **Fai login** con le tue credenziali
4. **Carica un file** di prova
5. **Verifica che appaia** anche dall'app mobile

---

## 🆘 **RISOLUZIONE PROBLEMI**

### **Log da Controllare:**
```bash
# Log Apache
sudo tail -f /var/log/apache2/error.log

# Log Nextcloud  
sudo tail -f /var/www/html/nextcloud/data/nextcloud.log

# Log Sistema
sudo journalctl -f
```

### **Problemi Comuni:**

**❌ "Sito non raggiungibile"**
- Verifica port forwarding router
- Controlla che DuckDNS sia aggiornato: `cat ~/duckdns/duck.log`

**❌ "Certificato non valido"**
- Rigenera certificato: `sudo certbot renew --force-renewal`

**❌ "Errore database"**
- Verifica credenziali in `/var/www/html/nextcloud/config/config.php`
- Testa connessione: `mysql -u nextclouduser -p nextcloud`

**❌ "Errore permessi file"**
- Ripristina permessi: `sudo chown -R www-data:www-data /var/www/html/nextcloud /mnt/cloud-storage/nextcloud-data`

---

## 🎯 **RISULTATO FINALE**

**🎉 Congratulazioni! Ora hai:**
- ☁️ **Cloud personale 1TB** accessibile da ovunque
- 🔒 **Sicurezza enterprise** con HTTPS e protezioni
- 📱 **App mobile** per sync automatico
- 💰 **Costo zero** (solo elettricità ~€2/mese)
- 🛡️ **Privacy totale** - dati solo a casa tua

**🌍 Accesso:**
- **Web:** https://tuodominio.duckdns.org
- **Mobile:** App Nextcloud
- **Desktop:** Client Nextcloud

**📊 Capacità:**
- **Spazio:** 1TB (vs 15GB Google Drive gratuito)
- **Utenti:** Unlimited
- **Traffico:** Unlimited
- **Controllo:** 100% tuo

**🚀 Prossimi passi:**
- Invita famiglia/amici come utenti
- Configura backup automatici
- Esplora app aggiuntive (Calendar, Contacts, Office, ecc.)

---

**💡 Suggerimento:** Salva questo file per riferimenti futuri e condividilo con chi vuole il proprio cloud personale!