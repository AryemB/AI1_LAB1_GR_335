<?php
namespace App\Model;

use App\Service\Config;

class Car
{
    private ?int $id = null;
    private ?string $brand = null;
    private ?string $model = null;
    private ?int $year = null;
    private ?string $description = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): Car
    {
        $this->id = $id;
        return $this;
    }

    public function getBrand(): ?string
    {
        return $this->brand;
    }

    public function setBrand(?string $brand): Car
    {
        $this->brand = $brand;
        return $this;
    }

    public function getModel(): ?string
    {
        return $this->model;
    }

    public function setModel(?string $model): Car
    {
        $this->model = $model;
        return $this;
    }

    public function getYear(): ?int
    {
        return $this->year;
    }

    public function setYear($year): Car
    {
        if ($year === '' || $year === null) {
            $this->year = null;
            return $this;
        }

        $this->year = (int)$year;
        return $this;
    }


    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): Car
    {
        $this->description = $description;
        return $this;
    }

    public static function fromArray($array): Car
    {
        $car = new self();
        $car->fill($array);
        return $car;
    }

    public function fill($array): Car
    {
        if (isset($array['id']) && !$this->getId()) {
            $this->setId($array['id']);
        }
        if (isset($array['brand'])) {
            $this->setBrand($array['brand']);
        }
        if (isset($array['model'])) {
            $this->setModel($array['model']);
        }
        if (isset($array['year'])) {
            $this->setYear($array['year']);
        }
        if (isset($array['description'])) {
            $this->setDescription($array['description']);
        }
        return $this;
    }

    public static function findAll(): array
    {
        $pdo = new \PDO(Config::get('db_dsn'), Config::get('db_user'), Config::get('db_pass'));
        $statement = $pdo->prepare("SELECT * FROM car");
        $statement->execute();

        $cars = [];
        foreach ($statement->fetchAll(\PDO::FETCH_ASSOC) as $carArray) {
            $cars[] = self::fromArray($carArray);
        }
        return $cars;
    }

    public static function find($id): ?Car
    {
        $pdo = new \PDO(Config::get('db_dsn'), Config::get('db_user'), Config::get('db_pass'));
        $statement = $pdo->prepare("SELECT * FROM car WHERE id = :id");
        $statement->execute(['id' => $id]);

        $carArray = $statement->fetch(\PDO::FETCH_ASSOC);
        if (!$carArray) {
            return null;
        }
        return self::fromArray($carArray);
    }

    public function save(): void
    {
        $pdo = new \PDO(Config::get('db_dsn'), Config::get('db_user'), Config::get('db_pass'));

        if (!$this->getId()) {
            $statement = $pdo->prepare("
                INSERT INTO car (brand, model, year, description)
                VALUES (:brand, :model, :year, :description)
            ");
            $statement->execute([
                'brand' => $this->getBrand(),
                'model' => $this->getModel(),
                'year' => $this->getYear(),
                'description' => $this->getDescription(),
            ]);
            $this->setId($pdo->lastInsertId());
        } else {
            $statement = $pdo->prepare("
                UPDATE car SET brand=:brand, model=:model, year=:year, description=:description
                WHERE id=:id
            ");
            $statement->execute([
                ':brand' => $this->getBrand(),
                ':model' => $this->getModel(),
                ':year' => $this->getYear(),
                ':description' => $this->getDescription(),
                ':id' => $this->getId()
            ]);
        }
    }

    public function delete(): void
    {
        $pdo = new \PDO(Config::get('db_dsn'), Config::get('db_user'), Config::get('db_pass'));
        $statement = $pdo->prepare("DELETE FROM car WHERE id = :id");
        $statement->execute([':id' => $this->getId()]);

        $this->setId(null);
        $this->setBrand(null);
        $this->setModel(null);
        $this->setYear(null);
        $this->setDescription(null);
    }
}
