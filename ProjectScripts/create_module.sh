#!/bin/bash
while true; do
    echo -e "Modül adı aşağıdaki kriterlere uygun olmalıdır:\n"
    echo -e "1- İlk harf büyük olmalı,\n2- Boşluk, özel karakter veya sayı bulunmamalıdır.\n"
    read -p "Modül adını girin: " moduleName

    # Modül adının boş olmadığını kontrol et
    if [ -z "$moduleName" ]; then
        echo "Hata: Modül adı boş olamaz. Lütfen tekrar deneyin."
        continue
    fi

    # İlk harfin büyük olduğunu kontrol et
    firstChar=$(echo "$moduleName" | cut -c1)
    if [[ ! "$firstChar" =~ [[:upper:]] ]]; then
        echo "Hata: Modül adının ilk harfi büyük olmalıdır. Lütfen tekrar deneyin."
        continue
    fi

    # Modül adında boşluk, özel karakter veya sayı olmadığını kontrol et
    if [[ "$moduleName" =~ [[:space:][:punct:][:digit:]] ]]; then
        echo "Hata: Modül adında boşluk, özel karakter veya sayı bulunmamalıdır. Lütfen tekrar deneyin."
        continue
    fi

    break
done

mkdir -p "../Modules/$moduleName"

echo -e "\
import PocketConfigManager from \"../../pocket-core/PocketConfigManager.js\";\n\
import PocketLog from \"../../pocket-core/PocketLog.js\";\n\
import Pocket from \"../../pocket-core/Pocket.js\";\n\
import PocketMongo, { dbClient } from \"../../pocket-core/PocketMongo.js\";\n\
import PocketQueryFilter from \"../../pocket-core/PocketQueryFilter.js\";\n\
import PocketUtility from \"../../pocket-core/PocketUtility.js\";\n\
import PocketService, { execute } from \"../../pocket-core/PocketService.js\";\n\n\
// PocketLib importer\n\
export const PocketLib = {\n\
\tPocketConfigManager,\n\
\tPocketLog,\n\
\tPocketUtility,\n\
\tPocketMongo,\n\
\tPocketQueryFilter,\n\
\tPocketService,\n\
\texecute,\n\
\tdbClient,\n\
\tPocket\n\
};" > "../Modules/$moduleName/constants.js"

mkdir -p "../Modules/$moduleName/services"

echo "İşlem tamamlandı. Modules/$moduleName/constants.js dosyası oluşturuldu."
read -n 1 -s -r -p "Devam etmek için bir tuşa basın..."
