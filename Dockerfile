FROM registry.access.redhat.com/ubi9/nodejs-18:latest AS build

USER root
RUN command -v yarn || npm i -g yarn

ADD . /usr/src/app
WORKDIR /usr/src/app
RUN mv NOTICE.txt ../
RUN yarn install
RUN yarn build
RUN mv ../NOTICE.txt dist/

FROM registry.access.redhat.com/ubi9/nginx-120:latest

LABEL io.k8s.display-name="Susanoo by NetAPp" \
      io.k8s.description="NetApp's Susanoo plugin for OpenShift Console" \
      io.openshift.tags="openshift" \
      maintainer="Rom Adams @ NetApp"

COPY --from=build /usr/src/app/dist /usr/share/nginx/html
USER 1001

ENTRYPOINT ["nginx", "-g", "daemon off;"]