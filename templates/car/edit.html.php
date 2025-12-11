<?php
$title = "Edit Car {$car->getBrand()} {$car->getModel()} ({$car->getId()})";
$bodyClass = "edit";
?>

<?php ob_start(); ?>
    <h1><?= $title ?></h1>

    <form action="<?= $router->generatePath('car-edit') ?>" method="post" class="edit-form">
        <?php require __DIR__ . '/_form.html.php'; ?>
        <input type="hidden" name="action" value="car-edit">
        <input type="hidden" name="id" value="<?= $car->getId() ?>">
    </form>

    <ul class="action-list">
        <li><a href="<?= $router->generatePath('car-index') ?>">Back to list</a></li>
        <li>
            <form action="<?= $router->generatePath('car-delete') ?>" method="post">
                <input type="submit" value="Delete" onclick="return confirm('Are you sure?')">
                <input type="hidden" name="action" value="car-delete">
                <input type="hidden" name="id" value="<?= $car->getId() ?>">
            </form>
        </li>
    </ul>

<?php $main = ob_get_clean();

include __DIR__ . '/../base.html.php';
