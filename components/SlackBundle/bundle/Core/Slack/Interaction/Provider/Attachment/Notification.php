<?php

/**
 * NovaeZSlackBundle Bundle.
 *
 * @package   Novactive\Bundle\eZSlackBundle
 *
 * @author    Novactive <s.morel@novactive.com>
 * @copyright 2018 Novactive
 * @license   https://github.com/Novactive/NovaeZSlackBundle/blob/master/LICENSE MIT Licence
 */

declare(strict_types=1);

namespace Novactive\Bundle\eZSlackBundle\Core\Slack\Interaction\Provider\Attachment;

use eZ\Publish\API\Repository\Events\Notification\CreateNotificationEvent;
use Symfony\Contracts\EventDispatcher\Event;

class Notification extends AttachmentProvider
{
    public function getAttachment(Event $event): ?array
    {
        if (!$event instanceof CreateNotificationEvent) {
            return null;
        }

        return null;
    }
}
