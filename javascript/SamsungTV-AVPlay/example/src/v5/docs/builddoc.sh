jsdoc -c conf.json
jsdoc -c conf_private.json -p

scp -r ./html/* root@web2.nice264.com:/var/www/developer_nicepeople_wp/apidocs/js/
