# Use phusion/passenger-nodejs as base image (see https://github.com/phusion/passenger-docker)
FROM phusion/passenger-nodejs:0.9.11

MAINTAINER Alban Mouton <alban.mouton@gmail.com>

# Set correct environment variables.
ENV HOME /root

# Use baseimage-docker's init process.
CMD ["/sbin/my_init"]

# Deploy web applications to nginx
ADD ./http-exposition /home/app/http-exposition
RUN \
  cd /home/app/http-exposition/ && \
  npm install --production
#ADD ./mediation /home/app/mediation
#RUN \
#  cd /home/app/mediation/ && \
#  npm install --production

# configure nginx/phusion-passenger to run applications
ADD ./nginx-apps.conf /etc/nginx/sites-enabled/apps
RUN rm /etc/nginx/sites-enabled/default

# start nginx and passenger
RUN rm -f /etc/service/nginx/down

# Clean up APT when done.
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*