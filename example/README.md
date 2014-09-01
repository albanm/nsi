nsi-example
===========

*Node.js Services Integration - Example*

**Don't try to install it yet. Things are not functional.**

Install
-------

The latest version of the example is automaticaly built into a [docker](https://www.docker.com/) image available on docker-hub.

This image has to be linked to 2 other images containing a [rabbitmq](https://www.rabbitmq.com) broker and a monitoring service based on [elasticsearch](http://www.elasticsearch.org/) and [kibana](http://www.elasticsearch.org/overview/kibana/).

    docker pull albanm/nsi-rabbitmq
    docker pull albanm/nsi-monitor
    docker pull albanm/nsi-example

Run
---

Prepare a directory to persist data from the containers.

    mkdir /mnt/nsi-example/

Run rabbitmq and expose its management UI on [localhost:15672](localhost:15672).

    docker run -p 15672:15672 --name rabbitmq -v /mnt/nsi-example/rabbitmq:/data albanm/nsi-rabbitmq

Run the monitoring service and expose its UI on [localhost:82].

    docker run -d -p 82:80 -v /mnt/nsi-example/monitor:/data albanm/nsi-monitor

Run the routes and mock services of this example and expose its endpoints on [localhost](localhost). Link the image to the broker and the monitoring service.

    docker run -p 80:80 -v /mnt/nsi-example/routes:/data --link monitor:monitor --link rabbitmq:rabbitmq albanm/nsi-example

Test
----

Each route has an independant test suite for individual validation.

    cd example/http-exposition
    npm install
    npm test

The whole example should soon have some integration test suite.

Explore
-------

**TODO.** List of management and monitoring URLs. Path to log files, etc.