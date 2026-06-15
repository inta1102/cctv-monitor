<?php

namespace App\Jobs;

use App\Services\WhatsApp\WhatsAppNotifier;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class SendWaTemplateJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 5;

    public int $timeout = 25;

    public function backoff(): array
    {
        return [10, 30, 60, 120, 300];
    }

    public function __construct(
        public string $to,
        public string $template,
        public array $vars = [],
        public array $meta = []
    ) {
        $this->onQueue('wa');
    }

    public function handle(WhatsAppNotifier $wa): void
    {
        if (!(bool) config('whatsapp.enabled', true)) {
            Log::info('[WA][JOB][SKIP_DISABLED]', [
                'to' => $this->to,
                'template' => $this->template,
            ]);
            return;
        }

        $vars = array_values($this->vars ?? []);

        $wa->sendTemplate(
            $this->to,
            $this->template,
            $vars,
            is_array($this->meta) ? $this->meta : []
        );

        Log::info('[WA][JOB][SENT]', [
            'to' => $this->to,
            'template' => $this->template,
            'vars_count' => count($vars),
        ]);
    }

    public function failed(Throwable $e): void
    {
        Log::error('[WA][JOB][FAILED]', [
            'to' => $this->to,
            'template' => $this->template,
            'vars' => $this->vars,
            'meta' => $this->meta,
            'error' => $e->getMessage(),
        ]);
    }
}
