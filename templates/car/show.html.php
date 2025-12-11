<?php
$title = "{$car->getBrand()} {$car->getModel()} ({$car->getId()})";
$bodyClass = 'show';
?>

<?php ob_start(); ?>
    <h1><?= $car->getBrand() ?> <?= $car->getModel() ?></h1>

    <article>
        <p><strong>Year:</strong> <?= $car->getYear() ?></p>
        <p><?= nl2br(htmlspecialchars($car->getDescription())) ?></p>
    </article>

    <ul class="action-list">
        <li><a href="<?= $router->generatePath('car-index') ?>">Back to list</a></li>
        <li><a href="<?= $router->generatePath('car-edit', ['id'=> $car->getId()]) ?>">Edit</a></li>
    </ul>
<?php $main = ob_get_clean();

include __DIR__ . '/../base.html.php';
