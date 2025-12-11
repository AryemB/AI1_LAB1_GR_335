<?php
namespace App\Controller;

use App\Exception\NotFoundException;
use App\Model\Car;
use App\Service\Router;
use App\Service\Templating;

class CarController
{
    public function indexAction(Templating $templating, Router $router): ?string
    {
        $cars = Car::findAll();
        return $templating->render('car/index.html.php', [
            'cars' => $cars,
            'router' => $router,
        ]);
    }

    public function createAction(?array $requestCar, Templating $templating, Router $router): ?string
    {
        if ($requestCar) {
            $car = Car::fromArray($requestCar);
            $car->save();

            $router->redirect($router->generatePath('car-index'));
            return null;
        }

        $car = new Car();

        return $templating->render('car/create.html.php', [
            'car' => $car,
            'router' => $router,
        ]);
    }


    public function editAction(int $carId, ?array $requestCar, Templating $templating, Router $router): ?string
    {
        $car = Car::find($carId);
        if (!$car) {
            throw new NotFoundException("Missing car with id $carId");
        }

        if ($requestCar) {
            $car->fill($requestCar);
            $car->save();

            $router->redirect($router->generatePath('car-index'));
            return null;
        }

        return $templating->render('car/edit.html.php', [
            'car' => $car,
            'router' => $router,
        ]);
    }

    public function showAction(int $carId, Templating $templating, Router $router): ?string
    {
        $car = Car::find($carId);
        if (!$car) {
            throw new NotFoundException("Missing car with id $carId");
        }

        return $templating->render('car/show.html.php', [
            'car' => $car,
            'router' => $router,
        ]);
    }

    public function deleteAction(int $carId, Router $router): ?string
    {
        $car = Car::find($carId);
        if (!$car) {
            throw new NotFoundException("Missing car with id $carId");
        }

        $car->delete();

        $router->redirect($router->generatePath('car-index'));
        return null;
    }
}
