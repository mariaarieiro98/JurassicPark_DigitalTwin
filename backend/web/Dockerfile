FROM nginx

COPY ./jp.conf /etc/nginx/conf.d/web.conf
RUN mv /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.disabled

RUN rm -rf /usr/share/nginx/html/*
ADD build /usr/share/nginx/html
