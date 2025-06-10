{{/*
Expand the name of the chart.
*/}}
{{- define "susanoo.name" -}}
{{- default (default .Chart.Name .Release.Name) .Values.plugin.name | trunc 63 | trimSuffix "-" }}
{{- end }}


{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "susanoo.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "susanoo.labels" -}}
helm.sh/chart: {{ include "susanoo.chart" . }}
{{ include "susanoo.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "susanoo.selectorLabels" -}}
app: {{ include "susanoo.name" . }}
app.kubernetes.io/name: {{ include "susanoo.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/part-of: {{ include "susanoo.name" . }}
{{- end }}

{{/*
Create the name secret containing the certificate
*/}}
{{- define "susanoo.certificateSecret" -}}
{{ default (printf "%s-cert" (include "susanoo.name" .)) .Values.plugin.certificateSecretName }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "susanoo.serviceAccountName" -}}
{{- if .Values.plugin.serviceAccount.create }}
{{- default (include "susanoo.name" .) .Values.plugin.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.plugin.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create the name of the patcher
*/}}
{{- define "susanoo.patcherName" -}}
{{- printf "%s-patcher" (include "susanoo.name" .) }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "susanoo.patcherServiceAccountName" -}}
{{- if .Values.plugin.patcherServiceAccount.create }}
{{- default (printf "%s-patcher" (include "susanoo.name" .)) .Values.plugin.patcherServiceAccount.name }}
{{- else }}
{{- default "default" .Values.plugin.patcherServiceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create the secret to access the private image repository
*/}}
{{- define "imagePullSecret" }}
{{- with .Values.plugin.imageCredentials }}
{{- printf "{\"auths\":{\"%s\":{\"username\":\"%s\",\"password\":\"%s\",\"auth\":\"%s\"}}}" .registry .username .token (printf "%s:%s" .username .token | b64enc) | b64enc }}
{{- end }}
{{- end }}