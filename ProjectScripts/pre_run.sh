#!/bin/bash

# Başlatma öncesi betik: Modül ve servislerin doğruluğu

# Ana klasör
MAIN_FOLDER="Modules"

# Hata sayacı
ERROR_COUNT=0

# Hata mesajlarını görüntülemek için kullanılan fonksiyon
print_error() {
  echo "HATA: $1"
  ((ERROR_COUNT++))
}

# Ana klasörü kontrol et
if [ ! -d "$MAIN_FOLDER" ]; then
  echo "Ana klasör bulunamadı"
  print_error "Modules klasoru bulunamadi.: $MAIN_FOLDER"
fi

# Ana klasör içeriğini kontrol et
if [ $ERROR_COUNT -eq 0 ]; then
  echo "Modules klasör bulundu. İçerik kontrol ediliyor..."

  # Modüllerin içeriğini kontrol et
  for MODULE_FOLDER in $MAIN_FOLDER/*; do
    if [ ! -d "$MODULE_FOLDER" ]; then
      print_error "Modüles klasörü bulunamadı: $MODULE_FOLDER"
    else
      # Modül klasörü içinde services ve constants.js dosyası bulunmalı
      if [ ! -d "$MODULE_FOLDER/services" ]; then
        print_error "$MODULE_FOLDER Modulu icerisinde 'services' klasoru yok.";
      fi
      else
        print_error "$MODULE_FOLDER Modulu icerisinde 'services' klasoru mevcut.";
      fi
      if [ ! -f "$MODULE_FOLDER/constants.js" ]; then
        print_error "$MODULE_FOLDER Modulu icerisinde 'constants.js' klasoru yok.";
      fi
      else
        print_error "$MODULE_FOLDER Modulu icerisinde 'constants.js' klasoru mevcut.";
      fi

      # Servislerin içeriğini kontrol et
      for SERVICE_FILE in $MODULE_FOLDER/services/*; do
        if [ ! -f "$SERVICE_FILE" ]; then
          print_error "Servis dosyası bulunamadı: $SERVICE_FILE"
        fi
      done
    fi
  done
  read -n 1 -s -r -p "Bir tuşa basın to exit..."
fi

# Hatalar varsa çıkış yap
if [ $ERROR_COUNT -ne 0 ]; then
  echo "Hata sayısı: $ERROR_COUNT"
  echo "Hatalar tespit edildi, uygulama başlatılamıyor."
  read -n 1 -s -r -p "Bir tuşa basın to exit..."
  exit 1
else
  echo "Tüm modüller ve servisler doğru şekilde yüklendi ve tanımlandı. Uygulama başlatılıyor..."
fi
